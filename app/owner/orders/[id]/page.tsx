import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerOrderDetailContent } from "./OwnerOrderDetailContent";
import { getAdminOrderById } from "@/lib/actions/owner";
import { notFound } from "next/navigation";

interface OwnerOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Order Details | ATTARI Admin",
};

export default async function OwnerOrderDetailPage({ params }: OwnerOrderDetailPageProps) {
  const resolvedParams = await params;
  const order = await getAdminOrderById(resolvedParams.id);

  if (!order) notFound();

  return (
    <AdminLayout>
      <OwnerOrderDetailContent order={order} />
    </AdminLayout>
  );
}