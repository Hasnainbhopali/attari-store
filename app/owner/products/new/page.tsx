import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerProductFormContent } from "../OwnerProductFormContent";
import { getAdminCategories } from "@/lib/actions/owner";

export const metadata: Metadata = {
  title: "Create Product | ATTARI Admin",
};

export default async function OwnerProductNewPage() {
  const categories = await getAdminCategories();

  return (
    <AdminLayout>
      <OwnerProductFormContent product={null} categories={categories} isEditing={false} />
    </AdminLayout>
  );
}