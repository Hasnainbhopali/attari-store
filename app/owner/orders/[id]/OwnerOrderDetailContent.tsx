"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowLeft, RefreshCw, CreditCard, Truck, User, MapPin, Phone, Mail, Package, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface OwnerOrderDetailContentProps {
  order: {
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
    shippingAddressLine: string;
    shippingCity: string;
    shippingArea: string;
    shippingPostalCode: string | null;
    customerNotes: string | null;
    adminNotes: string | null;
    createdAt: Date;
    updatedAt: Date;
    user: { id: string; name: string | null; email: string; phone: string | null };
    items: Array<{
      id: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      product: { id: string; name: string; slug: string; images: Array<{ url: string }> } | null;
    }>;
    payments: Array<{
      id: string;
      method: string;
      status: string;
      amount: number;
      transactionId: string | null;
      paidAt: Date | null;
    }>;
    inventoryMovements: Array<{
      id: string;
      type: string;
      quantityChange: number;
      reason: string | null;
      createdAt: Date;
    }>;
  };
}

export function OwnerOrderDetailContent({ order }: OwnerOrderDetailContentProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState(order.status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order.payments[0]?.status ?? "PENDING");
  const [adminNotes, setAdminNotes] = useState(order.adminNotes ?? "");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingNotes, setIsUpdatingNotes] = useState(false);

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
    return <Badge variant={variants[status] || "outline"} className="text-sm">{status}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      PAID: "default",
      FAILED: "destructive",
      REFUNDED: "outline",
    };
    return <Badge variant={variants[status] || "outline"} className="text-sm">{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "COD": return "Cash on Delivery";
      case "JAZZCASH": return "JazzCash";
      case "EASYPAISA": return "EasyPaisa";
      case "BANK_TRANSFER": return "Bank Transfer";
      default: return method;
    }
  };

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/owner/orders/${order.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast({ title: "Order status updated" });
        router.refresh();
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
    setIsUpdatingPayment(true);
    try {
      const paymentId = order.payments[0]?.id;
      if (!paymentId) throw new Error("No payment found");
      const res = await fetch(`/api/owner/payments/${paymentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newPaymentStatus }),
      });
      if (res.ok) {
        toast({ title: "Payment status updated" });
        router.refresh();
      } else {
        toast({ title: "Failed to update payment status", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update payment status", variant: "destructive" });
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleNotesUpdate = async () => {
    setIsUpdatingNotes(true);
    try {
      const res = await fetch(`/api/owner/orders/${order.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });
      if (res.ok) {
        toast({ title: "Admin notes updated" });
        router.refresh();
      } else {
        toast({ title: "Failed to update notes", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to update notes", variant: "destructive" });
    } finally {
      setIsUpdatingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/owner/orders" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Product</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Unit Price</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.items.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/50">
                        <td className="px-4 py-4">
                          <Link href={item.product ? `/owner/products/${item.product.id}` : "#"} className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg border bg-muted overflow-hidden shrink-0">
                              {item.product?.images[0] && (
                                <Image src={item.product.images[0].url} alt={item.productName} fill className="object-cover" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-4 text-right">{formatPrice(item.unitPrice)}</td>
                        <td className="px-4 py-4 text-center">{item.quantity}</td>
                        <td className="px-4 py-4 text-right font-semibold">{formatPrice(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleNotesUpdate(); }}>
                <div className="flex gap-4">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this order..."
                    rows={3}
                    className="flex-1 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <Button type="submit" disabled={isUpdatingNotes}>
                    {isUpdatingNotes ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Status</span>
                {getStatusBadge(order.status)}
              </div>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button className="w-full" onClick={handleStatusUpdate} disabled={isUpdatingStatus}>
                {isUpdatingStatus ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.payments.map((payment) => (
                <div key={payment.id} className="space-y-3 p-4 rounded-lg border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{getPaymentMethodLabel(payment.method)}</span>
                    {getPaymentStatusBadge(payment.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Amount</span>
                      <p className="font-semibold">{formatPrice(payment.amount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                        className="w-full rounded-lg border bg-muted/40 px-3 py-1.5 text-sm outline-none focus:border-primary"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </div>
                    {payment.transactionId && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Transaction ID</span>
                        <p className="font-mono text-sm">{payment.transactionId}</p>
                      </div>
                    )}
                    {payment.paidAt && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Paid At</span>
                        <p>{format(new Date(payment.paidAt), "MMM d, yyyy HH:mm")}</p>
                      </div>
                    )}
                    <Button className="w-full" variant="outline" onClick={handlePaymentUpdate} disabled={isUpdatingPayment}>
                      {isUpdatingPayment ? "Updating..." : "Update Payment Status"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="size-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.user.name ?? "Guest Customer"}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
              </div>
              {order.user.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="size-5 text-muted-foreground" />
                  <p>{order.user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <address className="not-italic space-y-1">
                <p className="font-medium">{order.shippingFullName}</p>
                <p>{order.shippingPhone}</p>
                <p>{order.shippingAddressLine}</p>
                <p>{order.shippingArea}, {order.shippingCity}</p>
                {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
              </address>
            </CardContent>
          </Card>

          {order.customerNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Customer Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.customerNotes}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Inventory Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-muted-foreground">Qty Change</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Reason</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.inventoryMovements.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No inventory movements</td>
                      </tr>
                    ) : (
                      order.inventoryMovements.map((movement) => (
                        <tr key={movement.id} className="hover:bg-muted/50">
                          <td className="px-4 py-2">
                            <Badge variant="outline" className="text-xs">{movement.type}</Badge>
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {movement.quantityChange > 0 ? "+" : ""}{movement.quantityChange}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground text-sm">{movement.reason ?? "—"}</td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">{format(new Date(movement.createdAt), "MMM d, yyyy HH:mm")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}