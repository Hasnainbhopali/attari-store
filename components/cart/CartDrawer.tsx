"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingCart, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "./CartContext";

export function CartDrawer() {
  const { items, itemCount, subtotal, isOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();

  if (!isOpen) return null;

  const deliveryFee = subtotal >= 5000 ? 0 : 200;
  const total = subtotal + deliveryFee;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={closeCart} aria-hidden="true" />
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-background shadow-xl flex flex-col transition-transform">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart ({itemCount})</h2>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close cart">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <ShoppingCart className="size-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Link href="/products" className="mt-4 text-primary hover:underline">
                Continue shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const image = item.product.images[0];
                const lineTotal = item.product.price * item.quantity;
                const isLowStock = item.product.stockQuantity > 0 && item.product.stockQuantity <= item.product.lowStockThreshold;
                const isOutOfStock = item.product.stockQuantity === 0;
                const maxQuantity = Math.max(1, item.product.stockQuantity);

                return (
                  <div key={item.id} className="flex gap-3">
                    <Link href={`/products/${item.product.slug}`} className="relative h-20 w-20 shrink-0 rounded-lg border bg-muted overflow-hidden">
                      {image && (
                        <Image src={image.url} alt={image.altText ?? item.product.name} fill className="object-cover" />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.slug}`} className="font-medium line-clamp-1 block hover:text-primary transition-colors">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            disabled={item.quantity <= 1}
                            className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-4" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, Math.min(maxQuantity, item.quantity + 1))}
                            disabled={item.quantity >= maxQuantity}
                            className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-4" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(lineTotal)}</span>
                      </div>
                      {(isLowStock || isOutOfStock) && (
                        <p className="mt-1 text-xs text-destructive">
                          {isOutOfStock ? "Out of stock" : `Only ${item.product.stockQuantity} left`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="size-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}</span>
              </div>
              {subtotal < 5000 && (
                <p className="text-xs text-muted-foreground">Add {formatPrice(5000 - subtotal)} more for free delivery</p>
              )}
              <div className="flex justify-between text-base font-semibold border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/cart">
                <Button className="w-full" size="lg">View Cart</Button>
              </Link>
              <Link href="/checkout">
                <Button className="w-full" size="lg" variant="secondary">Checkout</Button>
              </Link>
            </div>
            <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
              <Truck className="size-3.5" />
              Free delivery on orders over PKR 5,000
            </p>
          </div>
        )}
      </div>
    </>
  );
}