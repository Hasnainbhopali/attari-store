"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Trash2, ArrowLeft, ChevronRight, ShieldCheck, RotateCcw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartPageContentProps {
  cart: {
    id: string;
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        price: number;
        compareAtPrice: number | null;
        stockQuantity: number;
        lowStockThreshold: number;
        images: Array<{ id: string; url: string; altText: string | null }>;
      };
    }>;
  } | null;
}

export function CartPageContent({ cart }: CartPageContentProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!cart) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <svg className="mx-auto size-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0h14m-5 5v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m5-5l-3-3m0 0l3-3m-3 3h18" />
            </svg>
            <h1 className="mt-4 text-2xl font-bold">Please sign in to view your cart</h1>
            <p className="mt-2 text-muted-foreground">Your cart will be saved and synced across devices.</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Link href="/api/auth/signin?callbackUrl=/cart">
                <Button>Sign In</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const items = cart.items;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 5000 ? 0 : 200;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="size-4" />
            <span className="text-foreground font-medium">Cart</span>
          </nav>
          <div className="text-center py-16">
            <svg className="mx-auto size-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v4m0 0h14m-5 5v1a2 2 0 01-2 2H7a2 2 0 01-2-2v-1m5-5l-3-3m0 0l3-3m-3 3h18" />
            </svg>
            <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              Looks like you haven&apos;t added any products yet. Start shopping to fill your cart!
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <Link href="/products">
                <Button size="lg">
                  <ArrowLeft className="size-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Cart ({itemCount})</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h1 className="mb-6 text-3xl font-bold tracking-tight">Shopping Cart</h1>

            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => {
                      const image = item.product.images[0];
                      const lineTotal = item.product.price * item.quantity;
                      const hasDiscount = item.product.compareAtPrice && item.product.compareAtPrice > item.product.price;
                      const isLowStock = item.product.stockQuantity > 0 && item.product.stockQuantity <= item.product.lowStockThreshold;
                      const isOutOfStock = item.product.stockQuantity === 0;
                      const maxQuantity = Math.max(1, item.product.stockQuantity);

                      return (
                        <tr key={item.id} className={cn(isOutOfStock && "opacity-50")}>
                          <td className="px-4 py-4">
                            <Link href={`/products/${item.product.slug}`} className="flex items-center gap-4">
                              <div className="h-20 w-20 shrink-0 rounded-lg border bg-muted overflow-hidden">
                                {image && (
                                  <Image src={image.url} alt={image.altText ?? item.product.name} fill className="object-cover" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{item.product.name}</p>
                                <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                                {hasDiscount && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    Save {Math.round(((item.product.compareAtPrice! - item.product.price) / item.product.compareAtPrice!) * 100)}%
                                  </Badge>
                                )}
                                {isLowStock && (
                                  <Badge variant="destructive" className="mt-1 text-xs">
                                    Low Stock ({item.product.stockQuantity} left)
                                  </Badge>
                                )}
                                {isOutOfStock && (
                                  <Badge variant="outline" className="mt-1 text-xs">Out of Stock</Badge>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-semibold">{formatPrice(item.product.price)}</span>
                              {hasDiscount && (
                                <span className="text-sm line-through text-muted-foreground">
                                  {formatPrice(item.product.compareAtPrice!)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {isOutOfStock ? (
                              <span className="text-destructive text-sm">Out of Stock</span>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    setUpdatingId(item.id);
                                    updateQuantity(item.id, Math.max(1, item.quantity - 1));
                                  }}
                                  disabled={item.quantity <= 1 || updatingId === item.id}
                                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="size-4" />
                                </button>
                                <span className="w-10 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    setUpdatingId(item.id);
                                    updateQuantity(item.id, Math.min(maxQuantity, item.quantity + 1));
                                  }}
                                  disabled={item.quantity >= maxQuantity || updatingId === item.id}
                                  className="p-2 rounded-lg border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="size-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold">{formatPrice(lineTotal)}</td>
                          <td className="px-4 py-4 text-center">
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={updatingId === item.id}
                              className="p-2 text-muted-foreground hover:text-destructive hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
                              aria-label="Remove {item.product.name}"
                            >
                              <Trash2 className="size-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t flex justify-end">
                <Link href="/products">
                  <Button variant="ghost">
                    <ArrowLeft className="size-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-6">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}</span>
                  </div>
                  {subtotal < 5000 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Add {formatPrice(5000 - subtotal)} more for free delivery
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Taxes and shipping calculated at checkout
                </p>
              </div>

              <div className="space-y-3">
                <Link href="/checkout">
                  <Button className="w-full" size="lg">Proceed to Checkout</Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full">Continue Shopping</Button>
                </Link>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">On orders over PKR 5,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <RotateCcw className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">COD, JazzCash, EasyPaisa, Bank</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function updateQuantity(cartItemId: string, quantity: number) {
  fetch(`/api/cart/${cartItemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  }).catch(console.error);
}

function removeItem(cartItemId: string) {
  fetch(`/api/cart/${cartItemId}`, {
    method: "DELETE",
  }).catch(console.error);
}