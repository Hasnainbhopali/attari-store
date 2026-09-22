import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerProductsContent } from "./OwnerProductsContent";
import { getAdminProducts, getAdminCategories } from "@/lib/actions/owner";

interface OwnerProductsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    isActive?: string;
    isFeatured?: string;
    lowStock?: string;
    sortBy?: string;
    page?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Products | ATTARI Admin",
  description: "Manage products",
};

export default async function OwnerProductsPage({ searchParams }: OwnerProductsPageProps) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams.page ?? "1", 10));
  const pageSize = 20;

  const filters = {
    search: resolvedParams.search,
    categoryId: resolvedParams.categoryId,
    isActive: resolvedParams.isActive ? resolvedParams.isActive === "true" : undefined,
    isFeatured: resolvedParams.isFeatured ? resolvedParams.isFeatured === "true" : undefined,
    lowStock: resolvedParams.lowStock === "true",
    sortBy: resolvedParams.sortBy as "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc" | "stock-asc" | "stock-desc" || "newest",
    page,
    pageSize,
  };

  const [productsResult, categories] = await Promise.all([
    getAdminProducts(filters),
    getAdminCategories(),
  ]);

  return (
    <AdminLayout>
      <OwnerProductsContent
        productsResult={productsResult}
        categories={categories}
        filters={filters}
      />
    </AdminLayout>
  );
}