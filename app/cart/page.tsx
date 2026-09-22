import { Metadata } from "next";
import { getCart } from "@/lib/actions/cart";
import { CartPageContent } from "./CartPageContent";

export const metadata: Metadata = {
  title: "Shopping Cart | ATTARI Electric & Hardware Store",
  description: "Review your shopping cart and proceed to checkout.",
};

export default async function CartPage() {
  const cart = await getCart();

  return <CartPageContent cart={cart} />;
}