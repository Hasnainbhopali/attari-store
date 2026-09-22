"use client";

import { CartProvider } from "@/components/cart";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      {children}
      <CartDrawer />
    </CartProvider>
  );
}