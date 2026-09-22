"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartContext";
import { cn } from "@/lib/utils";

export function CartButton() {
  const { itemCount, isOpen, toggleCart, isLoading } = useCart();

  return (
    <Link
      href="/cart"
      className={cn(
        "relative rounded-lg p-2.5 transition hover:bg-muted",
        isOpen && "bg-muted"
      )}
      onClick={(e) => {
        if (isOpen) return;
        e.preventDefault();
        toggleCart();
      }}
      aria-label={`Shopping cart${itemCount > 0 ? ` (${itemCount} items)` : ""}`}
    >
      <ShoppingCart className="size-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
      {isLoading && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </span>
      )}
    </Link>
  );
}