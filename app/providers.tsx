"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/cart";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <Header />
        {children}
        <CartDrawer />
      </CartProvider>
    </SessionProvider>
  );
}