"use client";

import Link from "next/link";
import { Search, ShoppingCart, CircleUserRound, Menu, X } from "lucide-react";
import { useState } from "react";
import { CartButton } from "@/components/cart";
import { cn } from "@/lib/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-none tracking-tight">ATTARI</p>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Electric & Hardware
              </p>
            </div>
          </div>
        </Link>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        <div className="relative ml-auto flex max-w-xl flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search electrical & hardware products..."
            className="h-10 w-full rounded-lg border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
          />
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/categories"
            className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Categories
          </Link>

          <CartButton />

          <Link
            href="/account"
            className="rounded-lg p-2.5 transition hover:bg-muted"
            aria-label="Account"
          >
            <CircleUserRound className="size-5" />
          </Link>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search electrical & hardware products..."
              className="h-10 w-full rounded-lg border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <nav className="flex flex-col gap-2">
            <Link
              href="/categories"
              className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted"
            >
              Categories
            </Link>
            <Link href="/cart" className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted">
              Cart
            </Link>
            <Link href="/account" className="rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-muted">
              Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}