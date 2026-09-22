import { Metadata } from "next";
import { getProducts, getCategories, type ProductFilters } from "@/lib/actions/products";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SearchFilters } from "@/components/product/SearchFilters";
import { Pagination } from "@/components/product/Pagination";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Products | ATTARI Electric & Hardware Store",
  description: "Browse our complete range of electrical, hardware, lighting, and tool products.",
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const pageSize = 12;

  const filters: ProductFilters = {
    search: resolvedParams.search,
    categoryId: resolvedParams.category
      ? await getCategoryIdBySlug(resolvedParams.category)
      : undefined,
    sortBy: (resolvedParams.sort as ProductFilters["sortBy"]) ?? "newest",
    page,
    pageSize,
  };

  const [productsResult, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);

  const categoryName = resolvedParams.category
    ? categories.find((c) => c.slug === resolvedParams.category)?.name
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-4" />
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {categoryName && (
              <>
                <ChevronRight className="size-4" />
                <span className="text-foreground font-medium">{categoryName}</span>
              </>
            )}
          </nav>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {categoryName ? `${categoryName} Products` : "All Products"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {productsResult.totalCount} product{productsResult.totalCount !== 1 ? "s" : ""} found
          </p>
        </div>

        <div className="flex gap-8 lg:grid lg:grid-cols-[260px_1fr]">
          <aside className="hidden w-64 shrink-0 lg:block">
            <SearchFilters
              categories={categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))}
              initialFilters={{
                search: resolvedParams.search,
                category: resolvedParams.category,
                sortBy: resolvedParams.sort,
              }}
            />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-6">
              <div className="flex items-center gap-2">
                <SearchFilters
                  categories={categories.map((c) => ({
                    id: c.id,
                    name: c.name,
                    slug: c.slug,
                  }))}
                  initialFilters={{
                    search: resolvedParams.search,
                    category: resolvedParams.category,
                    sortBy: resolvedParams.sort,
                  }}
                />
              </div>
            </div>

            <ProductGrid products={productsResult.products} />

            <div className="mt-8">
              <Pagination
                currentPage={productsResult.currentPage}
                totalPages={productsResult.totalPages}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

async function getCategoryIdBySlug(slug: string): Promise<string | undefined> {
  const category = await getCategories();
  return category.find((c) => c.slug === slug)?.id;
}