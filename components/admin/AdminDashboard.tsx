"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  iconColor: string;
  href?: string;
}

function StatCard({ title, value, change, icon, iconColor, href }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={cn("p-2 rounded-lg", iconColor)}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <p className={cn("text-xs mt-1", change >= 0 ? "text-green-600" : "text-red-600")}>
            <span className="flex items-center gap-1">
              {change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
              {Math.abs(change)}% vs last month
            </span>
          </p>
        )}
        {href && (
          <Link href={href} className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
            View details
            <ArrowUpRight className="size-3" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

interface RecentOrderRowProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customerEmail: string;
  };
}

function RecentOrderRow({ order }: RecentOrderRowProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      CONFIRMED: "default",
      PROCESSING: "default",
      SHIPPED: "default",
      DELIVERED: "default",
      CANCELLED: "destructive",
    };
    return <Badge variant={variants[status] || "outline"} className="text-xs">{status}</Badge>;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("en-PK", { dateStyle: "short", timeStyle: "short" }).format(new Date(date));

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="px-4 py-3">
        <Link href={`/owner/orders/${order.id}`} className="font-medium text-primary hover:underline">
          {order.orderNumber}
        </Link>
      </td>
      <td className="px-4 py-3">{order.customerEmail}</td>
      <td className="px-4 py-3">{formatPrice(order.total)}</td>
      <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
    </tr>
  );
}

interface LowStockProductRowProps {
  product: {
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    images: Array<{ url: string }>;
  };
}

function LowStockProductRow({ product }: LowStockProductRowProps) {
  const isOutOfStock = product.stockQuantity === 0;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="px-4 py-3">
        <Link href={`/owner/products/${product.id}`} className="flex items-center gap-3">
          <img src={product.images[0]?.url ?? "/placeholder.svg"} alt={product.name} className="h-10 w-10 rounded-lg object-cover" />
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.sku}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className={cn("font-medium", isOutOfStock ? "text-destructive" : "text-orange-600")}>
          {product.stockQuantity}
        </span>
        <span className="text-muted-foreground ml-1">/ {product.lowStockThreshold}</span>
      </td>
      <td className="px-4 py-3">
        <Badge variant={isOutOfStock ? "destructive" : "secondary"} className="text-xs">
          {isOutOfStock ? "Out of Stock" : "Low Stock"}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Link href={`/owner/products/${product.id}`} className="text-sm text-primary hover:underline">
          Restock
        </Link>
      </td>
    </tr>
  );
}

export function AdminDashboard({
  stats,
  recentOrders,
  lowStockProducts,
}: {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalRevenue: number;
    ordersByStatus: Array<{ status: string; count: number }>;
    revenueByMonth: Array<{ month: string; revenue: number }>;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    customerEmail: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    lowStockThreshold: number;
    images: Array<{ url: string }>;
  }>;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your store.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(stats.totalRevenue)}
          icon={<DollarSign className="size-5" />}
          iconColor="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          href="/owner/orders"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="size-5" />}
          iconColor="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          href="/owner/orders"
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="size-5" />}
          iconColor="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          href="/owner/products"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="size-5" />}
          iconColor="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          href="/owner/customers"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs w-24">{item.status}</Badge>
                    <div className="h-2 w-48 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(item.count / Math.max(...stats.ordersByStatus.map(s => s.count))) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-1">
              {stats.revenueByMonth.map((item, index) => {
                const maxRevenue = Math.max(...stats.revenueByMonth.map(r => r.revenue));
                const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                      title={`${item.month}: ${new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(item.revenue)}`}
                    />
                    <span className="text-xs text-muted-foreground">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/owner/orders" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => <RecentOrderRow key={order.id} order={order} />)
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-orange-600" />
              Low Stock Products
            </CardTitle>
            <Link href="/owner/inventory" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Stock</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">All products well stocked</td>
                    </tr>
                  ) : (
                    lowStockProducts.map((product) => <LowStockProductRow key={product.id} product={product} />)
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}