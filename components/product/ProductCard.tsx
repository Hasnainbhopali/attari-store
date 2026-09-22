"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart";
import type { ProductCardProps } from "./types";

export function ProductCard({ product, variant = "grid" }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const image = product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addItem(product.id, 1);
    setAdding(false);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md",
        variant === "list" && "flex flex-row items-stretch"
      )}
    >
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center bg-muted/50 shrink-0",
          variant === "grid" ? "w-full" : "w-48"
        )}
      >
        {image && (
          <Image
            src={image.url}
            alt={image.altText ?? product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes={variant === "grid" ? "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" : "12rem"}
          />
        )}

        {(hasDiscount || isLowStock || isOutOfStock) && (
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {hasDiscount && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
            {isLowStock && (
              <Badge variant="secondary" className="text-xs">
                Low Stock
              </Badge>
            )}
            {isOutOfStock && (
              <Badge variant="outline" className="text-xs">
                Out of Stock
              </Badge>
            )}
          </div>
        )}

        {variant === "grid" && (
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleAddToCart}
              disabled={isOutOfStock || adding}
              aria-label={`Add ${product.name} to cart`}
            >
              {adding ? (
                <svg className="animate-spin size-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0h14m-5 5v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m5-5l-3-3m0 0l3-3m-3 3h18" />
                </svg>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className={cn("p-4 flex flex-col", variant === "list" && "flex-1 justify-between")}>
        <div>
          {product.category && (
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {product.category.name}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold">{formatPrice(product.price)}</span>
            {hasDiscount && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {variant === "list" && !isOutOfStock && (
            <Button size="sm" className="ml-auto" onClick={handleAddToCart} disabled={adding}>
              {adding ? "Adding..." : "Add to Cart"}
            </Button>
          )}
        </div>

        {isOutOfStock && (
          <p className="mt-2 text-xs text-destructive">Out of stock</p>
        )}
      </div>
    </Link>
  );
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}