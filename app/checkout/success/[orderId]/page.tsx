import { Metadata } from "next";
import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/orders";
import { OrderSuccessContent } from "./OrderSuccessContent";
import { redirect } from "next/navigation";

interface OrderSuccessPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderSuccessPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Order Confirmation | ATTARI Electric & Hardware Store`,
    description: `Your order has been placed successfully.`,
  };
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/account");
  }

  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.orderId);

  if (!order) {
    redirect("/account/orders");
  }

  return <OrderSuccessContent order={order} />;
}