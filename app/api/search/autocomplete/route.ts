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

  const { q, limit = 8 } = validation.data;

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  if (q.length > 50) {
    return NextResponse.json(
      { error: "Query too long" },
      { status: 400 }
    );
  }

  try {
    // Fetch product suggestions with trigram similarity
    const productResults = await prisma.$queryRawUnsafe<Array<{
      id: string;
      name: string;
      slug: string;
      imageUrl: string | null;
      categoryName: string | null;
      similarity: number;
    }>>(
      `
      SELECT
        p.id,
        p.name,
        p.slug,
        pi.url as "imageUrl",
        c.name as "categoryName",
        GREATEST(
          similarity(p.name, $1),
          similarity(p.sku, $1)
        ) as similarity
      FROM "Product" p
      LEFT JOIN "ProductImage" pi ON pi."productId" = p.id AND pi."sortOrder" = 0
      LEFT JOIN "Category" c ON c.id = p."categoryId"
      WHERE p."isActive" = true
        AND (
          similarity(p.name, $1) > 0.3
          OR similarity(p.sku, $1) > 0.3
        )
      ORDER BY similarity DESC, p."isFeatured" DESC, p."stockQuantity" DESC
      LIMIT $2
      `,
      q,
      Math.min(limit, 6)
    );

    // Category suggestions
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        name: { contains: q, mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 3,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    const productSuggestions = productResults.map((p) => ({
      type: "product" as const,
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.imageUrl,
      category: p.categoryName,
    }));

    const categorySuggestions = categories.map((c) => ({
      type: "category" as const,
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c._count.products,
    }));

    // Combine and limit total suggestions
    const allSuggestions = [
      ...productSuggestions,
      ...categorySuggestions,
    ].slice(0, limit);

    return NextResponse.json({
      suggestions: allSuggestions,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error("Autocomplete API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}