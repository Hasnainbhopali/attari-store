import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { productIds } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    const items = productIds
      .map((productId) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return null;
        return {
          id: `guest-${product.id}`,
          productId: product.id,
          quantity: 1,
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            stockQuantity: product.stockQuantity,
            lowStockThreshold: product.lowStockThreshold,
            images: product.images.map((img) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
            })),
          },
        };
      })
      .filter(Boolean);

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Guest cart fetch error:", error);
    return NextResponse.json({ items: [] });
  }
}