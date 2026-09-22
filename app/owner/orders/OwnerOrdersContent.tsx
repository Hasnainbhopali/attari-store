"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Eye, Truck, CreditCard, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/admin/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface OwnerOrdersContentProps {
  ordersResult: {
    orders: Array<{
      id: string;
      orderNumber: string;
      status: string;
      subtotal: number;
      deliveryFee: number;
      discount: number;
      total: number;
      customerEmail: string;
      shippingFullName: string;
      shippingPhone: string;
      shippingCity: string;
      shippingArea: string;
      createdAt: Date;
      updatedAt: Date;
      items: Array<{
        id: string;
        productName: string;
        sku: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }>;
      payments: Array<{
        id: string;
        method: string;
        status: string;
        amount: number;
      }>;
      _count: { items: number };
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  filters: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  };
}

export function OwnerOrdersContent({ ordersResult, filters }: OwnerOrdersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof ordersResult.orders[0] | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/owner/orders?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (query: string) => {
    updateFilters({ search: query || undefined });
  };

  const handleFilterChange = (filters: Record<string, string>) => {
    Object.entries(filters).forEach(([key, value]) => {
      updateFilters({ [key]: value || undefined });
    });
  };

  const handleSort = (key: string) => {
    const currentSort = searchParams.get("sortBy") || "newest";
    const newSort = currentSort === key ? `${key}-desc` : key;
    updateFilters({ sortBy: newSort });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
  };

  const openStatusDialog = (order: typeof ordersResult.orders[0]) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const openPaymentDialog = (order: typeof ordersResult.orders[0]) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.payments[0]?.status ?? "PENDING");
    setPaymentDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/owner/orders/${selectedOrder.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: "Order status updated" });
        router.refresh();
        setStatusDialogOpen(false);
      } else {
        toast({ title: "Failed to update status", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentUpdate = async () => {
    if (!selectedOrder || !newPaymentStatus) return;
    setIsUpdatingPayment(true);
    try {
      const paymentId = selectedOrder.payments[0]?.id;
      if (!paymentId) throw new Error("No payment found");
      const res = await fetch(`/api/owner/payments/${paymentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newPaymentStatus }),
      });
      if (res.ok) {
        toast({ title: "Payment status updated" });
        router.refresh();
        setPaymentDialogOpen(false);
      } else {
        toast({ title: "Failed to update payment status", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update payment status", variant: "destructive" });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

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

  const columns = [
    {
      key: "orderNumber",
      header: "Order",
      render: (order: typeof ordersResult.orders[0]) => (
        <Link href={`/owner/orders/${order.id}`} className="font-medium text-primary hover:underline">
          {order.orderNumber}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order: typeof ordersResult.orders[0]) => (
        <div>
          <p className="font-medium">{order.shippingFullName}</p>
          <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      render: (order: typeof ordersResult.orders[0]) => (
        <span className="font-semibold">{formatPrice(order.total)}</span>
      ),
      sortable: true,
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      render: (order: typeof ordersResult.orders[0]) => getStatusBadge(order.status),
    },
    {
      key: "paymentStatus",
      header: "Payment",
      render: (order: typeof ordersResult.orders[0]) => getPaymentStatusBadge(order.payments[0]?.status ?? "PENDING"),
    },
    {
      key: "date",
      header: "Date",
      render: (order: typeof ordersResult.orders[0]) => (
        <span className="text-sm text-muted-foreground">{format(new Date(order.createdAt), "MMM d, yyyy HH:mm")}</span>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      render: (order: typeof ordersResult.orders[0]) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/owner/orders/${order.id}`} className="p-2 rounded-lg hover:bg-muted" title="View">
            <Eye className="size-4" />
          </Link>
          <button onClick={() => openStatusDialog(order)} className="p-2 rounded-lg hover:bg-muted" title="Update Status">
            <RefreshCw className="size-4" />
          </button>
          <button onClick={() => openPaymentDialog(order)} className="p-2 rounded-lg hover:bg-muted" title="Update Payment">
            <CreditCard className="size-4" />
          </button>
        </div>
      ),
      className: "w-36 text-right",
    },
  ];

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const paymentStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "FAILED", label: "Failed" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [{ value: "", label: "All" }, ...statusOptions],
    },
    {
      key: "paymentStatus",
      label: "Payment",
      options: [{ value: "", label: "All" }, ...paymentStatusOptions],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>Change the status for order {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>Change the payment status for order {selectedOrder?.orderNumber}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment status" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePaymentUpdate} disabled={isUpdatingPayment}>
              {isUpdatingPayment ? "Updating..." : "Update Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={ordersResult.orders}
        keyExtractor={(o) => o.id}
        searchKey={["orderNumber", "customerEmail", "shippingFullName"]}
        filterOptions={filterOptions}
        sortBy={filters.sortBy}
        sortOrder={filters.sortBy?.endsWith("-desc") ? "desc" : "asc"}
        onSort={handleSort}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pagination={{
          currentPage: ordersResult.currentPage,
          totalPages: ordersResult.totalPages,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No orders found"
      />
    </div>
  );
}