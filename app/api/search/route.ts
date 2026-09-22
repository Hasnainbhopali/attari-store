import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchRateLimit } from "@/lib/rate-limiter";
import { searchQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await searchRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // Validation
  const searchParams = request.nextUrl.searchParams;
  const validation = searchQuerySchema.safeParse({
    q: searchParams.get("q")?.trim(),
    limit: searchParams.get("limit"),
  });

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { q, limit = 10 } = validation.data;

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
          ],
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
            select: { id: true, url: true, altText: true },
          },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.category.findMany({
        where: {
          isActive: true,
          name: { contains: q, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: { where: { isActive: true } } } },
        },
      }),
    ]);

    return NextResponse.json({
      suggestions: categories.map((c) => ({
        type: "category",
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        stockQuantity: p.stockQuantity,
        image: p.images[0]?.url ?? null,
        category: p.category,
      })),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}