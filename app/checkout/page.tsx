import { Metadata } from "next";
import { auth } from "@/auth";
import { getCart } from "@/lib/actions/cart";
import { getCategories } from "@/lib/actions/products";
import { CheckoutForm } from "./CheckoutForm";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout | ATTARI Electric & Hardware Store",
  description: "Complete your order with secure checkout.",
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/checkout`);
  }

  const [cart, categories] = await Promise.all([
    getCart(),
    getCategories(),
  ]);

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  return <CheckoutForm cart={cart} categories={categories} />;
}