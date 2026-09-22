import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserOrders } from "@/lib/actions/orders";
import Link from "next/link";
import { ChevronRight, Package, Calendar, CreditCard, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "My Orders | ATTARI Electric & Hardware Store",
  description: "View and manage your order history.",
};

export default async function OrdersPage() {
  const orders = await getUserOrders();

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

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PAID: "default",
      FAILED: "destructive",
      REFUNDED: "outline",
    };
    return <Badge variant={variants[status] || "outline"} className="text-xs">{status}</Badge>;
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <Link href="/account" className="hover:text-foreground">Account</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">My Orders</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="mt-2 text-muted-foreground">
            View and track your order history
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto size-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Package className="size-8 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold">No orders yet</h2>
            <p className="mt-2 text-muted-foreground max-w-md mx-auto">
              You haven&apos;t placed any orders yet. Start shopping to see your orders here.
            </p>
            <div className="mt-8">
              <Link href="/products">
                <Button size="lg">
                  Start Shopping
                  <ChevronRight className="size-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto flex-1">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-mono font-medium text-primary">{order.orderNumber}</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{order._count.items} item{order._count.items !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto shrink-0">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    {order.payments[0] && (
                      <>
                        <span className="text-muted-foreground">|</span>
                        {getPaymentStatusBadge(order.payments[0].status)}
                      </>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                    <div className="text-right sm:w-auto">
                      <p className="font-bold text-lg">{new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(order.total)}</p>
                      <p className="text-xs text-muted-foreground">{order.payments[0]?.method ?? "COD"}</p>
                    </div>
                    <ChevronRightIcon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}