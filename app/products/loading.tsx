import { ProductSkeletonGrid } from "@/components/product/ProductGrid";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="mt-2 h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        <div className="flex gap-8 lg:grid lg:grid-cols-[260px_1fr]">
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="h-96 bg-muted animate-pulse rounded" />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="hidden lg:flex lg:items-center lg:justify-between lg:mb-6">
              <div className="h-12 w-full bg-muted animate-pulse rounded" />
            </div>
            <ProductSkeletonGrid count={12} />
          </main>
        </div>
      </div>
    </div>
  );
}