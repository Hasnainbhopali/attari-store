"use client";

import { CheckCircle2, Truck, CreditCard, ShieldCheck, Clock, Mail, Phone, MapPin, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface OrderDetailContentProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    shippingFullName: string;
    shippingPhone: string;
    shippingAddressLine: string;
    shippingCity: string;
    shippingArea: string;
    shippingPostalCode: string | null;
    customerNotes: string | null;
    createdAt: Date;
    items: Array<{
      id: string;
      productName: string;
      sku: string;
      unitPrice: number;
      quantity: number;
      lineTotal: number;
      product: {
        id: string;
        name: string;
        slug: string;
        images: Array<{ id: string; url: string; altText: string | null }>;
      } | null;
    }>;
    payments: Array<{
      id: string;
      method: string;
      status: string;
      amount: number;
    }>;
  };
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-PK", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));

const getStatusColor = (status: string) => {
  switch (status) {
    case "PENDING": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "CONFIRMED": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "PROCESSING": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "SHIPPED": return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
    case "DELIVERED": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "CANCELLED": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
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

export function OrderDetailContent({ order }: OrderDetailContentProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <Link href="/account" className="hover:text-foreground">Account</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Order #{order.orderNumber}</span>
        </nav>

        <div className="text-center py-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-muted/50 dark:bg-muted/40">
            <Clock className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            View complete information for your order {order.orderNumber}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Number</span>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="flex items-center gap-2">
                    <CreditCard className="size-4 text-muted-foreground" />
                    {getPaymentMethodLabel(order.payments[0]?.method ?? "COD")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant={order.payments[0]?.status === "PAID" ? "default" : "outline"}>
                    {order.payments[0]?.status ?? "PENDING"}
                  </Badge>
                </div>
              </div>
            </section>

            {order.customerNotes && (
              <section className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Order Notes</h2>
                <p className="text-muted-foreground">{order.customerNotes}</p>
              </section>
            )}

            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-semibold border-t pt-3">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Shipping Address</h2>
              <address className="text-muted-foreground not-italic space-y-1">
                <p className="font-medium">{order.shippingFullName}</p>
                <p>{order.shippingPhone}</p>
                <p>{order.shippingAddressLine}</p>
                <p>{order.shippingArea}, {order.shippingCity}</p>
                {order.shippingPostalCode && <p>{order.shippingPostalCode}</p>}
              </address>
            </section>

            <section className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Order Items ({itemCount})</h2>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const image = item.product?.images[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 rounded-lg border bg-muted overflow-hidden">
                        {image && (
                          <Image
                            src={image.url}
                            alt={image.altText ?? item.productName}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account/orders">
              <Button className="flex-1 size-sm">← Back to Orders</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="flex-1 size-sm">Continue Shopping</Button>
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground">
            Questions about your order?{" "}
            <Link href="/contact" className="underline hover:text-foreground">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}