"use client";

import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";
import type { ProductGridProps, ProductSkeletonProps } from "./types";

export function ProductGrid({ products, variant = "grid", className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto size-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p className="mt-4 text-muted-foreground">No products found</p>
      </div>
    );
  }

  return (
    <div
      className={className}
      data-slot="product-grid"
    >
      {variant === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}

export function ProductSkeletonGrid({ variant = "grid", count = 8 }: ProductSkeletonProps) {
  return (
    <div data-slot="product-grid-skeleton">
      {variant === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: count }).map((_, i) => (
            <ProductSkeleton key={i} variant="grid" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <ProductSkeleton key={i} variant="list" />
          ))}
        </div>
      )}
    </div>
  );
}