import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerInventoryContent } from "./OwnerInventoryContent";
import { getAdminInventory, getAdminCategories } from "@/lib/actions/owner";

interface OwnerInventoryPageProps {
  searchParams: Promise<{
    search?: string;
    lowStock?: string;
    outOfStock?: string;
    categoryId?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Inventory | ATTARI Admin",
  description: "Manage inventory",
};

export default async function OwnerInventoryPage({ searchParams }: OwnerInventoryPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const pageSize = 20;

  const filters = {
    search: resolvedParams.search,
    lowStock: resolvedParams.lowStock === "true",
    outOfStock: resolvedParams.outOfStock === "true",
    categoryId: resolvedParams.categoryId,
    sortBy: resolvedParams.sortBy as "newest" | "name-asc" | "stock-asc" | "stock-desc" || "stock-asc",
    page,
    pageSize,
  };

  const [inventoryResult, categories] = await Promise.all([
    getAdminInventory(filters),
    getAdminCategories(),
  ]);

  return (
    <AdminLayout>
      <OwnerInventoryContent inventoryResult={inventoryResult} categories={categories} filters={filters} />
    </AdminLayout>
  );
}