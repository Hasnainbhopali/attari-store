import { z } from "zod";

export const searchQuerySchema = z.object({
  q: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const cartItemSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().min(1).max(99),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export const addressSchema = z.object({
  shippingFullName: z.string().min(1).max(200),
  shippingPhone: z.string().min(10).max(20).regex(/^[\d\s\-\+\(\)]+$/),
  shippingAddressLine: z.string().min(1).max(200),
  shippingCity: z.string().min(1).max(100),
  shippingArea: z.string().min(1).max(100),
  shippingPostalCode: z.string().max(20).optional(),
});

export const checkoutSchema = z.object({
  shippingFullName: z.string().min(1).max(200),
  shippingPhone: z.string().min(10).max(20).regex(/^[\d\s\-\+\(\)]+$/),
  shippingAddressLine: z.string().min(1).max(200),
  shippingCity: z.string().min(1).max(100),
  shippingArea: z.string().min(1).max(100),
  shippingPostalCode: z.string().max(20).optional(),
  customerNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(["COD", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA"]),
});

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  sku: z.string().min(1).max(50),
  description: z.string().max(5000).optional(),
  price: z.number().positive().max(999999.99),
  compareAtPrice: z.number().positive().max(999999.99).optional().nullable(),
  stockQuantity: z.number().int().min(0).max(99999).default(0),
  lowStockThreshold: z.number().int().min(0).max(1000).default(5),
  categoryId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(1000).optional(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const stockAdjustmentSchema = z.object({
  productId: z.string().cuid(),
  quantityChange: z.number().int().min(-9999).max(9999),
  reason: z.string().max(500).optional(),
  type: z.enum(["IN", "OUT_SALE", "IN_RETURN", "ADJUSTMENT", "DAMAGED"]),
});

export const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const paymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]),
});

export const adminNotesSchema = z.object({
  adminNotes: z.string().max(1000).optional(),
});

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return async (request: Request): Promise<{ data: T } | { error: string; status: number }> => {
    try {
      const body = await request.json();
      const result = schema.safeParse(body);
      
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors as Record<string, string[]>;
        const firstError = Object.values(errors)[0]?.[0] || "Validation failed";
        return { error: firstError, status: 400 };
      }
      
      return { data: result.data };
    } catch {
      return { error: "Invalid JSON", status: 400 };
    }
  };
}