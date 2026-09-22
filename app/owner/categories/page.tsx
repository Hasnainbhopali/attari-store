import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerCategoriesContent } from "./OwnerCategoriesContent";
import { getAdminCategories } from "@/lib/actions/owner";

export const metadata: Metadata = {
  title: "Categories | ATTARI Admin",
  description: "Manage categories",
};

export default async function OwnerCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <AdminLayout>
      <OwnerCategoriesContent categories={categories} />
    </AdminLayout>
  );
}