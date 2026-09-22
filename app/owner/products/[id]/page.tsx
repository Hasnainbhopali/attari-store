import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { OwnerProductFormContent } from "../OwnerProductFormContent";
import { getAdminProductById, getAdminCategories } from "@/lib/actions/owner";
import { notFound } from "next/navigation";

interface OwnerProductEditPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Edit Product | ATTARI Admin",
};

export default async function OwnerProductEditPage({ params }: OwnerProductEditPageProps) {
  const resolvedParams = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(resolvedParams.id),
    getAdminCategories(),
  ]);

  if (!product) notFound();

  return (
    <AdminLayout>
      <OwnerProductFormContent
        product={product}
        categories={categories}
        isEditing={true}
      />
    </AdminLayout>
  );
}