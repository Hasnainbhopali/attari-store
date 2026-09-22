"use server";

import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ==========================================
// SCHEMAS FOR VALIDATION
// ==========================================

const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  sku: z.string().min(1, "SKU is required").max(50),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const productUpdateSchema = productCreateSchema.partial();

const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

const categoryUpdateSchema = categoryCreateSchema.partial();

const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

const paymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

const stockAdjustmentSchema = z.object({
  productId: z.string(),
  quantityChange: z.number().int(),
  reason: z.string().optional(),
  type: z.enum(["IN", "OUT_SALE", "IN_RETURN", "ADJUSTMENT", "DAMAGED"]),
});

// ==========================================
// DASHBOARD STATS
// ==========================================

export async function getDashboardStats() {
  await requireOwner();

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
    revenueByMonth,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, stockQuantity: { lte: prisma.product.fields.lowStockThreshold } },
      take: 10,
      orderBy: { stockQuantity: "asc" },
      select: { id: true, name: true, sku: true, stockQuantity: true, lowStockThreshold: true, images: { take: 1, orderBy: { sortOrder: "asc" } } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        total: true,
        createdAt: true,
        customerEmail: true,
        items: { select: { id: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT 
        to_char("createdAt", 'YYYY-MM') as month,
        SUM("total")::numeric as revenue
      FROM "Order"
      WHERE "status" != 'CANCELLED'
        AND "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY to_char("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `,
  ]);

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue: Number(totalRevenue._sum.total ?? 0),
    lowStockProducts: lowStockProducts.map((p) => ({
      ...p,
      images: p.images.map((img) => ({ id: img.id, url: img.url })),
    })),
    recentOrders: recentOrders.map((o) => ({ ...o, total: Number(o.total), createdAt: o.createdAt.toISOString() })),
    ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count })),
    revenueByMonth: revenueByMonth.map((r) => ({ month: r.month, revenue: Number(r.revenue) })),
  };
}

// ==========================================
// PRODUCTS
// ==========================================

export interface AdminProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  lowStock?: boolean;
  sortBy?: "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "stock-asc" | "stock-desc";
  page?: number;
  pageSize?: number;
}

export interface AdminPaginatedProducts {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    isFeatured: boolean;
    category: { id: string; name: string } | null;
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getAdminProducts(filters: AdminProductFilters = {}): Promise<AdminPaginatedProducts> {
  await requireOwner();

  const {
    search,
    categoryId,
    isActive,
    isFeatured,
    lowStock,
    sortBy = "newest",
    page = 1,
    pageSize = 20,
  } = filters;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) where.categoryId = categoryId;
  if (isActive !== undefined) where.isActive = isActive;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;
  if (lowStock) where.stockQuantity = { lte: prisma.product.fields.lowStockThreshold };

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "oldest": orderBy.createdAt = "asc"; break;
    case "price-asc": orderBy.price = "asc"; break;
    case "price-desc": orderBy.price = "desc"; break;
    case "name-asc": orderBy.name = "asc"; break;
    case "name-desc": orderBy.name = "desc"; break;
    case "stock-asc": orderBy.stockQuantity = "asc"; break;
    case "stock-desc": orderBy.stockQuantity = "desc"; break;
    case "newest":
    default: orderBy.createdAt = "desc"; break;
  }

  const skip = (page - 1) * pageSize;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        description: true,
        price: true,
        compareAtPrice: true,
        stockQuantity: true,
        lowStockThreshold: true,
        isActive: true,
        isFeatured: true,
        category: { select: { id: true, name: true } },
        images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, altText: true, sortOrder: true } },
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function getAdminProductById(id: string) {
  await requireOwner();

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      price: true,
      compareAtPrice: true,
      stockQuantity: true,
      lowStockThreshold: true,
      isActive: true,
      isFeatured: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: "asc" }, select: { id: true, url: true, altText: true, sortOrder: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  };
}

export async function createProduct(data: z.infer<typeof productCreateSchema>) {
  await requireOwner();

  const validated = productCreateSchema.parse(data);

  // Check for duplicate slug/sku
  const existing = await prisma.product.findFirst({
    where: { OR: [{ slug: validated.slug }, { sku: validated.sku }] },
  });
  if (existing) {
    throw new Error(existing.slug === validated.slug ? "Slug already exists" : "SKU already exists");
  }

  const product = await prisma.product.create({
    data: {
      ...validated,
      price: validated.price,
      compareAtPrice: validated.compareAtPrice ?? null,
    },
  });

  revalidatePath("/owner/products");
  return { success: true, product };
}

export async function updateProduct(id: string, data: z.infer<typeof productUpdateSchema>) {
  await requireOwner();

  const validated = productUpdateSchema.parse(data);

  if (validated.slug) {
    const existing = await prisma.product.findFirst({
      where: { slug: validated.slug, id: { not: id } },
    });
    if (existing) throw new Error("Slug already exists");
  }
  if (validated.sku) {
    const existing = await prisma.product.findFirst({
      where: { sku: validated.sku, id: { not: id } },
    });
    if (existing) throw new Error("SKU already exists");
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...validated,
      price: validated.price,
      compareAtPrice: validated.compareAtPrice ?? null,
    },
  });

  revalidatePath("/owner/products");
  revalidatePath(`/owner/products/${id}`);
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  await requireOwner();

  await prisma.product.delete({ where: { id } });
  revalidatePath("/owner/products");
  return { success: true };
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  await requireOwner();

  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath("/owner/products");
  return { success: true };
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getAdminCategories() {
  await requireOwner();

  return prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      isActive: true,
      parentId: true,
      parent: { select: { id: true, name: true } },
      children: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          image: true,
          isActive: true,
          parentId: true,
          children: { select: { id: true, name: true } },
          _count: { select: { products: true } },
          createdAt: true,
          updatedAt: true,
        },
      },
      _count: { select: { products: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createCategory(data: z.infer<typeof categoryCreateSchema>) {
  await requireOwner();

  const validated = categoryCreateSchema.parse(data);

  const existing = await prisma.category.findUnique({ where: { slug: validated.slug } });
  if (existing) throw new Error("Slug already exists");

  const category = await prisma.category.create({ data: validated });
  revalidatePath("/owner/categories");
  return { success: true, category };
}

export async function updateCategory(id: string, data: z.infer<typeof categoryUpdateSchema>) {
  await requireOwner();

  const validated = categoryUpdateSchema.parse(data);

  if (validated.slug) {
    const existing = await prisma.category.findFirst({ where: { slug: validated.slug, id: { not: id } } });
    if (existing) throw new Error("Slug already exists");
  }

  const category = await prisma.category.update({ where: { id }, data: validated });
  revalidatePath("/owner/categories");
  revalidatePath(`/owner/categories/${id}`);
  return { success: true, category };
}

export async function deleteCategory(id: string) {
  await requireOwner();

  // Check if category has products
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error("Cannot delete category with products. Reassign or delete products first.");
  }

  // Check if category has children
  const childrenCount = await prisma.category.count({ where: { parentId: id } });
  if (childrenCount > 0) {
    throw new Error("Cannot delete category with subcategories. Delete subcategories first.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/owner/categories");
  return { success: true };
}

// ==========================================
// ORDERS
// ==========================================

export interface AdminOrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "newest" | "oldest" | "total-asc" | "total-desc";
  page?: number;
  pageSize?: number;
}

export interface AdminPaginatedOrders {
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    customerEmail: string;
    shippingFullName: string;
    shippingPhone: string;
    shippingCity: string;
    shippingArea: string;
    createdAt: Date;
    updatedAt: Date;
    items: Array<{
      id: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
    }>;
    payments: Array<{
      id: string;
      method: string;
      status: string;
      amount: number;
    }>;
    _count: { items: number };
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<AdminPaginatedOrders> {
  await requireOwner();

  const {
    status,
    paymentStatus,
    search,
    dateFrom,
    dateTo,
    sortBy = "newest",
    page = 1,
    pageSize = 20,
  } = filters;

  const where: Record<string, unknown> = {};

  if (status) where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
      { shippingFullName: { contains: search, mode: "insensitive" } },
    ];
  }
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, Date>).gte = dateFrom;
    if (dateTo) (where.createdAt as Record<string, Date>).lte = dateTo;
  }

  if (paymentStatus) {
    where.payments = { some: { status: paymentStatus } };
  }

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "oldest": orderBy.createdAt = "asc"; break;
    case "total-asc": orderBy.total = "asc"; break;
    case "total-desc": orderBy.total = "desc"; break;
    case "newest":
    default: orderBy.createdAt = "desc"; break;
  }

  const skip = (page - 1) * pageSize;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        subtotal: true,
        deliveryFee: true,
        discount: true,
        total: true,
        customerEmail: true,
        shippingFullName: true,
        shippingPhone: true,
        shippingCity: true,
        shippingArea: true,
        createdAt: true,
        updatedAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            sku: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
          },
        },
        payments: {
          select: { id: true, method: true, status: true, amount: true },
        },
        _count: { select: { items: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders: orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discount: Number(o.discount),
      total: Number(o.total),
      items: o.items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        lineTotal: Number(i.lineTotal),
      })),
      payments: o.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function getAdminOrderById(id: string) {
  await requireOwner();

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      subtotal: true,
      deliveryFee: true,
      discount: true,
      total: true,
      customerEmail: true,
      shippingFullName: true,
      shippingPhone: true,
      shippingAddressLine: true,
      shippingCity: true,
      shippingArea: true,
      shippingPostalCode: true,
      customerNotes: true,
      adminNotes: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        select: {
          id: true,
          productName: true,
          sku: true,
          unitPrice: true,
          quantity: true,
          lineTotal: true,
          product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
        },
      },
      payments: {
        select: { id: true, method: true, status: true, amount: true, transactionId: true, paidAt: true },
      },
      inventoryMovements: {
        select: { id: true, type: true, quantityChange: true, reason: true, createdAt: true },
      },
    },
  });

  if (!order) return null;

  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    discount: Number(order.discount),
    total: Number(order.total),
    items: order.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
    payments: order.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
}

export async function updateOrderStatus(id: string, status: string) {
  await requireOwner();

  const validated = orderStatusSchema.parse({ status });

  await prisma.order.update({
    where: { id },
    data: { status: validated.status },
  });

  revalidatePath("/owner/orders");
  revalidatePath(`/owner/orders/${id}`);
  return { success: true };
}

export async function updatePaymentStatus(id: string, status: string) {
  await requireOwner();

  const validated = paymentStatusSchema.parse({ status });

  await prisma.payment.update({
    where: { id },
    data: { status: validated.status, paidAt: validated.status === "PAID" ? new Date() : null },
  });

  revalidatePath("/owner/orders");
  return { success: true };
}

export async function updateOrderAdminNotes(id: string, adminNotes: string) {
  await requireOwner();

  await prisma.order.update({
    where: { id },
    data: { adminNotes },
  });

  revalidatePath(`/owner/orders/${id}`);
  return { success: true };
}

// ==========================================
// INVENTORY
// ==========================================

export interface AdminInventoryFilters {
  search?: string;
  lowStock?: boolean;
  outOfStock?: boolean;
  categoryId?: string;
  sortBy?: "newest" | "name-asc" | "stock-asc" | "stock-desc";
  page?: number;
  pageSize?: number;
}

export interface AdminPaginatedInventory {
  products: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    lowStockThreshold: number;
    isActive: boolean;
    category: { id: string; name: string } | null;
    _count: { inventoryMovements: number };
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getAdminInventory(filters: AdminInventoryFilters = {}): Promise<AdminPaginatedInventory> {
  await requireOwner();

  const { search, lowStock, outOfStock, categoryId, sortBy = "stock-asc", page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (lowStock) where.stockQuantity = { gt: 0, lte: prisma.product.fields.lowStockThreshold };
  if (outOfStock) where.stockQuantity = 0;
  if (categoryId) where.categoryId = categoryId;

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "name-asc": orderBy.name = "asc"; break;
    case "stock-desc": orderBy.stockQuantity = "desc"; break;
    case "newest": orderBy.createdAt = "desc"; break;
    case "stock-asc":
    default: orderBy.stockQuantity = "asc"; break;
  }

  const skip = (page - 1) * pageSize;

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stockQuantity: true,
        lowStockThreshold: true,
        isActive: true,
        category: { select: { id: true, name: true } },
        _count: { select: { inventoryMovements: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({ ...p, price: Number(p.price) })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function getInventoryMovements(productId: string, page = 1, pageSize = 20) {
  await requireOwner();

  const [movements, totalCount] = await Promise.all([
    prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        type: true,
        quantityChange: true,
        previousStock: true,
        newStock: true,
        reason: true,
        orderId: true,
        createdById: true,
        createdBy: { select: { id: true, name: true, email: true } },
        createdAt: true,
      },
    }),
    prisma.inventoryMovement.count({ where: { productId } }),
  ]);

  return {
    movements,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function adjustStock(data: z.infer<typeof stockAdjustmentSchema>) {
  await requireOwner();

  const validated = stockAdjustmentSchema.parse(data);
  const session = await requireOwner();

  const product = await prisma.product.findUnique({
    where: { id: validated.productId },
    select: { stockQuantity: true },
  });

  if (!product) throw new Error("Product not found");

  const newStock = product.stockQuantity + validated.quantityChange;
  if (newStock < 0) throw new Error("Insufficient stock for this adjustment");

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: validated.productId },
      data: { stockQuantity: newStock },
    });

    await tx.inventoryMovement.create({
      data: {
        productId: validated.productId,
        type: validated.type,
        quantityChange: validated.quantityChange,
        previousStock: product.stockQuantity,
        newStock,
        reason: validated.reason,
        createdById: session.id,
      },
    });
  });

  revalidatePath("/owner/inventory");
  return { success: true };
}

// ==========================================
// CUSTOMERS
// ==========================================

export interface AdminCustomerFilters {
  search?: string;
  hasOrders?: boolean;
  sortBy?: "newest" | "oldest" | "name-asc" | "name-desc" | "orders-desc";
  page?: number;
  pageSize?: number;
}

export interface AdminPaginatedCustomers {
  customers: Array<{
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    image: string | null;
    role: string;
    createdAt: Date;
    _count: { orders: number; addresses: number };
    totalSpent: number;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export async function getAdminCustomers(filters: AdminCustomerFilters = {}): Promise<AdminPaginatedCustomers> {
  await requireOwner();

  const { search, hasOrders, sortBy = "newest", page = 1, pageSize = 20 } = filters;

  const where: Record<string, unknown> = { role: "CUSTOMER" };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (hasOrders) {
    where.orders = { some: {} };
  }

  const orderBy: Record<string, string | { _count: "asc" | "desc" }> = {};
  switch (sortBy) {
    case "oldest": orderBy.createdAt = "asc"; break;
    case "name-asc": orderBy.name = "asc"; break;
    case "name-desc": orderBy.name = "desc"; break;
    case "orders-desc": orderBy.orders = { _count: "desc" as const }; break;
    case "newest":
    default: orderBy.createdAt = "desc"; break;
  }

  const skip = (page - 1) * pageSize;

  const [customers, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true, addresses: true } },
        orders: {
          where: { status: { not: "CANCELLED" } },
          select: { total: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    customers: customers.map((c) => ({
      ...c,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page,
  };
}

export async function getAdminCustomerById(id: string) {
  await requireOwner();

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          _count: { select: { items: true } },
        },
      },
      _count: { select: { orders: true, addresses: true } },
    },
  });
}