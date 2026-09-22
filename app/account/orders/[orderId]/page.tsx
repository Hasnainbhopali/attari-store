import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getOrderById } from "@/lib/actions/orders";
import { OrderDetailContent } from "./OrderDetailContent";
import { auth } from "@/auth";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: OrderDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.orderId);

  if (!order) {
    return { title: "Order Not Found" };
  }

  return {
    title: `Order ${order.orderNumber} | ATTARI Electric & Hardware Store`,
    description: `View details for order ${order.orderNumber}`,
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/api/auth/signin?callbackUrl=/account/orders/${(await params).orderId}`);
  }

  const resolvedParams = await params;
  const order = await getOrderById(resolvedParams.orderId);

  if (!order) {
    notFound();
  }

  // Ensure the order belongs to the current user
  if (order.userId !== session.user.id) {
    notFound();
  }

  return <OrderDetailContent order={order} />;
}