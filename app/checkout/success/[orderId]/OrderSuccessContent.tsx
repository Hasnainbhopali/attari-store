"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, Truck, RotateCcw, ShieldCheck, ChevronRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OrderSuccessContentProps {
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

export function OrderSuccessContent({ order }: OrderSuccessContentProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Order Confirmation</span>
        </nav>

        <div className="text-center py-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Order Confirmed!</h1>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Thank you for your order. We&apos;ve sent a confirmation email with your order details.
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

            {order.customerNotes && (
              <section className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-lg font-semibold">Order Notes</h2>
                <p className="text-muted-foreground">{order.customerNotes}</p>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Order Items ({itemCount})</h2>
              </div>
              <div className="space-y-4">
                {order.items.map((item) => {
                  const image = item.product?.images[0];
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 rounded-lg border bg-muted overflow-hidden">
                        {image && <Image src={image.url} alt={image.altText ?? item.productName} fill className="object-cover" />}
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

            <section className="rounded-xl border bg-card p-6 sticky top-24">
              <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{order.deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium">Free</span>
                  ) : (
                    formatPrice(order.deliveryFee)
                  )}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Free Delivery</p>
                    <p className="text-xs text-muted-foreground">On orders over PKR 5,000</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <RotateCcw className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Easy Returns</p>
                    <p className="text-xs text-muted-foreground">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">Multiple payment options</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/account/orders">
                  <Button className="w-full" size="lg">View Order Details</Button>
                </Link>
                <Link href="/products">
                  <Button variant="outline" className="w-full" size="lg">Continue Shopping</Button>
                </Link>
              </div>
            </section>
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