import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerOrdersContent } from "./OwnerOrdersContent";
import { getAdminOrders } from "@/lib/actions/owner";

interface OwnerOrdersPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Orders | ATTARI Admin",
  description: "Manage orders",
};

export default async function OwnerOrdersPage({ searchParams }: OwnerOrdersPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const pageSize = 20;

  const filters = {
    status: resolvedParams.status,
    paymentStatus: resolvedParams.paymentStatus,
    search: resolvedParams.search,
    dateFrom: resolvedParams.dateFrom ? new Date(resolvedParams.dateFrom) : undefined,
    dateTo: resolvedParams.dateTo ? new Date(resolvedParams.dateTo) : undefined,
    sortBy: resolvedParams.sortBy as "newest" | "oldest" | "total-asc" | "total-desc" || "newest",
    page,
    pageSize,
  };

  const ordersResult = await getAdminOrders(filters);

  return (
    <AdminLayout>
      <OwnerOrdersContent ordersResult={ordersResult} filters={filters} />
    </AdminLayout>
  );
}