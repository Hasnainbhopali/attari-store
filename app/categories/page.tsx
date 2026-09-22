import { Metadata } from "next";
import { getCategories } from "@/lib/actions/products";
import { CategoryCard } from "@/components/product/CategoryCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Categories | ATTARI Electric & Hardware Store",
  description: "Browse all product categories at ATTARI Electric & Hardware Store.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();
  const topLevelCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">All Categories</h1>
          <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
            Explore our wide range of electrical, hardware, lighting, and tool products.
          </p>
        </div>

        {topLevelCategories.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto size-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-4 text-muted-foreground">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {topLevelCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/products"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            View All Products
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}