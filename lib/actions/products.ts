"use server";

import { prisma } from "@/lib/prisma";
import { cache } from "react";

export const getCategories = cache(async () => {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      parentId: true,
      _count: { select: { products: { where: { isActive: true } } } },
    },
  });
});

export const getCategoryBySlug = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      parentId: true,
    },
  });
});

export interface ProductFilters {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
  sortBy?: "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  page?: number;
  pageSize?: number;
}

export interface PaginatedProducts {
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
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    category: { id: string; name: string; slug: string } | null;
  }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const getProducts = cache(async (filters: ProductFilters = {}): Promise<PaginatedProducts> => {
  const {
    categoryId,
    search,
    minPrice,
    maxPrice,
    isFeatured,
    inStock,
    sortBy = "newest",
    page = 1,
    pageSize = 12,
  } = filters;

  const where: Record<string, unknown> = {
    isActive: true,
  };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {} as Record<string, number>;
    if (minPrice !== undefined) (where.price as Record<string, number>).gte = minPrice;
    if (maxPrice !== undefined) (where.price as Record<string, number>).lte = maxPrice;
  }

  if (isFeatured) {
    where.isFeatured = true;
  }

  if (inStock) {
    where.stockQuantity = { gt: 0 };
  }

  const orderBy: Record<string, string> = {};
  switch (sortBy) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "name-asc":
      orderBy.name = "asc";
      break;
    case "name-desc":
      orderBy.name = "desc";
      break;
    case "newest":
    default:
      orderBy.createdAt = "desc";
      break;
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
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { id: true, url: true, altText: true, sortOrder: true },
        },
        category: { select: { id: true, name: true, slug: true } },
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
});

export const getProductBySlug = cache(async (slug: string) => {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
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
      images: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, altText: true, sortOrder: true },
      },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
});

export const getFeaturedProducts = cache(async (limit = 8) => {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      stockQuantity: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { id: true, url: true, altText: true, sortOrder: true },
      },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
});

export const getRelatedProducts = cache(async (productId: string, categoryId: string | null, limit = 4) => {
  if (!categoryId) return [];

  return prisma.product.findMany({
    where: {
      isActive: true,
      categoryId,
      id: { not: productId },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      stockQuantity: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { id: true, url: true, altText: true, sortOrder: true },
      },
      category: { select: { id: true, name: true, slug: true } },
    },
  });
});

export const getProductsByCategorySlug = cache(async (categorySlug: string, page = 1, pageSize = 12) => {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return { products: [], totalCount: 0, totalPages: 0, currentPage: 1 };

  return getProducts({ categoryId: category.id, page, pageSize });
});