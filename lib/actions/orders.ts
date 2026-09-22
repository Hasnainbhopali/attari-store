"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CheckoutData {
  shippingFullName: string;
  shippingPhone: string;
  shippingAddressLine: string;
  shippingCity: string;
  shippingArea: string;
  shippingPostalCode?: string;
  customerNotes?: string;
  paymentMethod: "COD" | "BANK_TRANSFER" | "JAZZCASH" | "EASYPAISA";
  idempotencyKey?: string;
}

export interface OrderSummary {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ATT-${timestamp}-${random}`;
}

function calculateOrderSummary(items: Array<{ price: number; quantity: number }>): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 5000 ? 0 : 200;
  const discount = 0;
  const total = subtotal + deliveryFee - discount;

  return { subtotal, deliveryFee, discount, total };
}

export async function createOrder(checkoutData: CheckoutData): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Cart is empty" };
  }

  // Validate stock and prices
  for (const item of cart.items) {
    if (!item.product.isActive) {
      return { success: false, error: `${item.product.name} is no longer available` };
    }
    if (item.product.stockQuantity < item.quantity) {
      return { success: false, error: `${item.product.name} has only ${item.product.stockQuantity} in stock` };
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true },
  });

  if (!user?.email) {
    return { success: false, error: "User email not found" };
  }

  const summary = calculateOrderSummary(
    cart.items.map((item) => ({
      price: Number(item.product.price),
      quantity: item.quantity,
    }))
  );

  const orderNumber = generateOrderNumber();

  // Check for existing order with same idempotency key
  if (checkoutData.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: checkoutData.idempotencyKey },
      select: { id: true, orderNumber: true },
    });

    if (existingOrder) {
      return { success: true, orderId: existingOrder.id, orderNumber: existingOrder.orderNumber };
    }
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          status: "PENDING",
          subtotal: summary.subtotal,
          deliveryFee: summary.deliveryFee,
          discount: summary.discount,
          total: summary.total,
          customerEmail: user.email,
          shippingFullName: checkoutData.shippingFullName,
          shippingPhone: checkoutData.shippingPhone,
          shippingAddressLine: checkoutData.shippingAddressLine,
          shippingCity: checkoutData.shippingCity,
          shippingArea: checkoutData.shippingArea,
          shippingPostalCode: checkoutData.shippingPostalCode,
          customerNotes: checkoutData.customerNotes,
          idempotencyKey: checkoutData.idempotencyKey,
        },
      });

      // Create order items with price snapshots
      for (const item of cart.items) {
        const unitPrice = Number(item.product.price);
        const lineTotal = unitPrice * item.quantity;

        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.product.id,
            productName: item.product.name,
            sku: item.product.sku,
            unitPrice,
            quantity: item.quantity,
            lineTotal,
          },
        });

        // Lock product row and decrement stock atomically to prevent overselling
        const productLock = await tx.$queryRaw<{ stockQuantity: number }[]>`
          SELECT "stockQuantity" FROM "Product" WHERE "id" = ${item.product.id} FOR UPDATE
        `;

        if (!productLock.length || productLock[0].stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.product.name}`);
        }

        const previousStock = productLock[0].stockQuantity;
        const newStock = previousStock - item.quantity;

        await tx.inventoryMovement.create({
          data: {
            productId: item.product.id,
            type: "OUT_SALE",
            quantityChange: -item.quantity,
            previousStock,
            newStock,
            reason: `Order ${orderNumber}`,
            orderId: newOrder.id,
            createdById: session.user.id,
          },
        });

        await tx.product.update({
          where: { id: item.product.id },
          data: { stockQuantity: newStock },
        });
      }

      // Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: summary.total,
          method: checkoutData.paymentMethod,
          status: "PENDING",
        },
      });

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    revalidatePath("/cart");
    revalidatePath("/account/orders");
    redirect(`/checkout/success/${order.id}`);
  } catch (error) {
    console.error("Create order error:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrderById(orderId: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      payments: true,
    },
  });

  if (!order || order.userId !== session.user.id) {
    return null;
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
}

export async function getUserOrders() {
  const session = await auth();

  if (!session?.user?.id) {
    return [];
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      payments: true,
      _count: { select: { items: true } },
    },
  });

  return orders.map((order) => ({
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  }));
}

export async function getOrderByNumber(orderNumber: string) {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
          },
        },
      },
      payments: true,
    },
  });

  if (!order || order.userId !== session.user.id) {
    return null;
  }

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      lineTotal: Number(item.lineTotal),
    })),
    payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
}