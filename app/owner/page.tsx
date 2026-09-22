import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { getDashboardStats } from "@/lib/actions/owner";

export const metadata: Metadata = {
  title: "Dashboard | ATTARI Admin",
  description: "Admin dashboard overview",
};

export default async function OwnerDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <AdminLayout>
      <AdminDashboard stats={stats} recentOrders={stats.recentOrders} lowStockProducts={stats.lowStockProducts} />
    </AdminLayout>
  );
}