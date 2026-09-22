"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Truck, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart";

interface ProductDetailProps {
  product: {
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
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      sortOrder: number;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  relatedProducts: Array<{
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number;
    compareAtPrice: number | null;
    stockQuantity: number;
    images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
    category: { id: string; name: string; slug: string } | null;
  }>;
  categories: Array<{ id: string; name: string; slug: string }>;
}

export function ProductDetail({ product, relatedProducts, categories }: ProductDetailProps) {
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.stockQuantity === 0;
  const maxQuantity = Math.max(1, product.stockQuantity);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const handleAddToCart = async () => {
    setAdding(true);
    await addItem(product.id, quantity);
    setAdding(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <Link href="/products" className="hover:text-foreground">Products</Link>
          {product.category && (
            <>
              <ChevronRight className="size-4" />
              <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl border bg-card overflow-hidden">
              {product.images[selectedImageIndex] && (
                <Image
                  src={product.images[selectedImageIndex].url}
                  alt={product.images[selectedImageIndex].altText ?? product.name}
                  fill
                  className="object-cover"
                  priority
                />
              )}

              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
                    }
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg hover:bg-background transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow-lg hover:bg-background transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "relative h-20 w-20 shrink-0 rounded-lg border-2 overflow-hidden transition-colors",
                      index === selectedImageIndex
                        ? "border-primary"
                        : "border-transparent hover:border-muted-foreground/50"
                    )}
                    aria-label={`View image ${index + 1}`}
                    aria-current={index === selectedImageIndex ? "true" : "false"}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText ?? `${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            {product.category && (
              <Link
                href={`/categories/${product.category.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                {product.category.name}
                <ChevronRight className="size-3.5" />
              </Link>
            )}

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>

            {product.sku && (
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            )}

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-xl line-through text-muted-foreground">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
              {hasDiscount && (
                <Badge variant="destructive" className="text-sm">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              ) : isLowStock ? (
                <Badge variant="secondary" className="text-sm">
                  Only {product.stockQuantity} left in stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                  In Stock
                </Badge>
              )}
            </div>

            {product.description && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <p className="whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            <div className="border-t pt-6">
              <div className="flex items-center gap-4 mb-4">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Quantity
                </Label>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = Math.min(Math.max(1, parseInt(e.target.value) || 1), maxQuantity);
                      setQuantity(val);
                    }}
                    min={1}
                    max={maxQuantity}
                    className="h-10 w-16 border-x text-center text-sm font-medium outline-none focus:bg-muted/50"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => setQuantity((prev) => Math.min(maxQuantity, prev + 1))}
                    disabled={quantity >= maxQuantity}
                    className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || adding}
                >
                  {adding ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="size-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className="size-4 mr-2" />
                  Wishlist
                </Button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Share2 className="size-4" />
                <button className="hover:text-foreground underline">Share</button>
              </div>
            </div>

            <div className="border-t pt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <Truck className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">On orders over PKR 5,000</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <RotateCcw className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-xs text-muted-foreground">COD, JazzCash, EasyPaisa</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">You may also like</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-muted/50">
                    {p.images[0] && (
                      <Image
                        src={p.images[0].url}
                        alt={p.images[0].altText ?? p.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    {p.category && (
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {p.category.name}
                      </p>
                    )}
                    <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-1.5">
                      <span className="text-base font-bold">{formatPrice(p.price)}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.price && (
                        <span className="text-sm line-through text-muted-foreground">
                          {formatPrice(p.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Label({ children, className, htmlFor, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium", className)} htmlFor={htmlFor} {...props}>
      {children}
    </label>
  );
}