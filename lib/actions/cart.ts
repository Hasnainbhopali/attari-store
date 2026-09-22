"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface CartItemData {
  productId: string;
  quantity: number;
}

export interface CartWithItems {
  id: string;
  userId: string | null;
  items: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      sku: string;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
      lowStockThreshold: number;
      images: Array<{ id: string; url: string; altText: string | null }>;
    };
  }>;
}

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

function mapCartItem(item: {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: { toString: () => string };
    compareAtPrice: { toString: () => string } | null;
    stockQuantity: number;
    lowStockThreshold: number;
    images: Array<{ id: string; url: string; altText: string | null }>;
  };
}): CartWithItems["items"][0] {
  return {
    id: item.id,
    quantity: item.quantity,
    product: {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      sku: item.product.sku,
      price: Number(item.product.price),
      compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
      stockQuantity: item.product.stockQuantity,
      lowStockThreshold: item.product.lowStockThreshold,
      images: item.product.images,
    },
  };
}

async function getOrCreateUserCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { sortOrder: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    });
  }

  return cart;
}

export async function getCart(): Promise<CartWithItems | null> {
  const session = await auth();

  if (session?.user?.id) {
    const cart = await getOrCreateUserCart(session.user.id);
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(mapCartItem),
    };
  }

  return null;
}

export async function getCartWithSession(): Promise<CartWithItems | null> {
  const session = await auth();

  if (session?.user?.id) {
    const cart = await getOrCreateUserCart(session.user.id);
    return {
      id: cart.id,
      userId: cart.userId,
      items: cart.items.map(mapCartItem),
    };
  }

  return null;
}

export async function addToCart(productId: string, quantity = 1): Promise<{ success: boolean; error?: string; cartId?: string }> {
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, stockQuantity: true, isActive: true },
  });

  if (!product || !product.isActive) {
    return { success: false, error: "Product not found" };
  }

  if (product.stockQuantity < quantity) {
    return { success: false, error: "Insufficient stock" };
  }

  try {
    if (session?.user?.id) {
      const cart = await getOrCreateUserCart(session.user.id);

      const existingItem = cart.items.find((item) => item.productId === productId);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stockQuantity) {
          return { success: false, error: "Insufficient stock" };
        }

        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }

      revalidatePath("/cart");
      return { success: true, cartId: cart.id };
    } else {
      return { success: true, cartId: "guest" };
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (quantity < 1) {
    return { success: false, error: "Quantity must be at least 1" };
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { product: true, cart: true },
  });

  if (!cartItem) {
    return { success: false, error: "Cart item not found" };
  }

  if (session?.user?.id && cartItem.cart.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  if (cartItem.product.stockQuantity < quantity) {
    return { success: false, error: "Insufficient stock" };
  }

  try {
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Update cart error:", error);
    return { success: false, error: "Failed to update cart" };
  }
}

export async function removeFromCart(cartItemId: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem) {
    return { success: false, error: "Cart item not found" };
  }

  if (session?.user?.id && cartItem.cart.userId !== session.user.id) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Remove from cart error:", error);
    return { success: false, error: "Failed to remove from cart" };
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
  });

  if (!cart) {
    return { success: true };
  }

  try {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Clear cart error:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function mergeGuestCart(guestCartItems: GuestCartItem[]): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!guestCartItems.length) {
    return { success: true };
  }

  try {
    const cart = await getOrCreateUserCart(session.user.id);

    for (const item of guestCartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, stockQuantity: true, isActive: true },
      });

      if (!product || !product.isActive) {
        continue;
      }

      const existingItem = cart.items.find((ci) => ci.productId === item.productId);
      const totalQuantity = (existingItem?.quantity ?? 0) + item.quantity;
      const finalQuantity = Math.min(totalQuantity, product.stockQuantity);

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: finalQuantity },
        });
      } else if (finalQuantity > 0) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: finalQuantity,
          },
        });
      }
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Merge guest cart error:", error);
    return { success: false, error: "Failed to merge cart" };
  }
}

export async function getCartCount(): Promise<number> {
  const session = await auth();

  if (!session?.user?.id) {
    return 0;
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    select: { items: { select: { quantity: true } } },
  });

  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

export async function validateCartStock(): Promise<{ valid: boolean; errors: string[] }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { valid: false, errors: ["Not authenticated"] };
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
    return { valid: false, errors: ["Cart is empty"] };
  }

  const errors: string[] = [];

  for (const item of cart.items) {
    if (!item.product.isActive) {
      errors.push(`${item.product.name} is no longer available`);
    } else if (item.product.stockQuantity < item.quantity) {
      errors.push(`${item.product.name} has only ${item.product.stockQuantity} in stock (you have ${item.quantity})`);
    }
  }

  return { valid: errors.length === 0, errors };
}