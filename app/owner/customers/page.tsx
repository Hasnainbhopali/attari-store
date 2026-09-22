import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerCustomersContent } from "./OwnerCustomersContent";
import { getAdminCustomers } from "@/lib/actions/owner";

interface OwnerCustomersPageProps {
  searchParams: Promise<{
    search?: string;
    hasOrders?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Customers | ATTARI Admin",
  description: "Manage customers",
};

export default async function OwnerCustomersPage({ searchParams }: OwnerCustomersPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const pageSize = 20;

  const filters = {
    search: resolvedParams.search,
    hasOrders: resolvedParams.hasOrders === "true",
    sortBy: resolvedParams.sortBy as "newest" | "oldest" | "name-asc" | "name-desc" | "orders-desc" || "newest",
    page,
    pageSize,
  };

  const customersResult = await getAdminCustomers(filters);

  return (
    <AdminLayout>
      <OwnerCustomersContent customersResult={customersResult} filters={filters} />
    </AdminLayout>
  );
}