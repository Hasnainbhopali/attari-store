"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldCheck, RotateCcw, Truck, CreditCard, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
  cart: {
    id: string;
    items: Array<{
      id: string;
      quantity: number;
      product: {
        id: string;
        name: string;
        slug: string;
        sku: string;
        price: number;
        compareAtPrice: number | null;
        stockQuantity: number;
        lowStockThreshold: number;
        images: Array<{ id: string; url: string; altText: string | null }>;
      };
    }>;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
  }>;
}

const paymentMethods = [
  {
    id: "COD",
    name: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: CreditCard,
    recommended: true,
  },
  {
    id: "JAZZCASH",
    name: "JazzCash",
    description: "Pay via JazzCash mobile wallet",
    icon: CreditCard,
  },
  {
    id: "EASYPAISA",
    name: "EasyPaisa",
    description: "Pay via EasyPaisa mobile wallet",
    icon: CreditCard,
  },
  {
    id: "BANK_TRANSFER",
    name: "Bank Transfer",
    description: "Direct bank transfer (IBAN provided after order)",
    icon: CreditCard,
  },
];

export function CheckoutForm({ cart, categories }: CheckoutFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedPayment, setSelectedPayment] = useState("COD");
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [formData, setFormData] = useState({
    shippingFullName: "",
    shippingPhone: "",
    shippingAddressLine: "",
    shippingCity: "",
    shippingArea: "",
    shippingPostalCode: "",
    customerNotes: "",
  });

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 5000 ? 0 : 200;
  const total = subtotal + deliveryFee;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.shippingFullName.trim()) newErrors.shippingFullName = "Full name is required";
    if (!formData.shippingPhone.trim()) newErrors.shippingPhone = "Phone number is required";
    else if (!/^[\d\s\-\+\(\)]{10,}$/.test(formData.shippingPhone)) newErrors.shippingPhone = "Enter a valid phone number";
    if (!formData.shippingAddressLine.trim()) newErrors.shippingAddressLine = "Address is required";
    if (!formData.shippingCity.trim()) newErrors.shippingCity = "City is required";
    if (!formData.shippingArea.trim()) newErrors.shippingArea = "Area/Region is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          paymentMethod: selectedPayment,
        }),
      });

      const data = await response.json();

      if (data.success && data.orderId) {
        router.push(`/checkout/success/${data.orderId}`);
      } else {
        setErrors({ form: data.error || "Failed to place order" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-4" />
          <Link href="/cart" className="hover:text-foreground">Cart</Link>
          <ChevronRight className="size-4" />
          <span className="text-foreground font-medium">Checkout</span>
        </nav>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="mb-4 text-xl font-semibold">Shipping Address</h2>
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="shippingFullName">Full Name *</Label>
                    <Input
                      id="shippingFullName"
                      value={formData.shippingFullName}
                      onChange={(e) => setFormData({ ...formData, shippingFullName: e.target.value })}
                      className="mt-1"
                      placeholder="John Doe"
                      aria-invalid={!!errors.shippingFullName}
                    />
                    {errors.shippingFullName && <p className="mt-1 text-sm text-destructive">{errors.shippingFullName}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shippingPhone">Phone Number *</Label>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      value={formData.shippingPhone}
                      onChange={(e) => setFormData({ ...formData, shippingPhone: e.target.value })}
                      className="mt-1"
                      placeholder="+92 3XX XXXXXXX"
                      aria-invalid={!!errors.shippingPhone}
                    />
                    {errors.shippingPhone && <p className="mt-1 text-sm text-destructive">{errors.shippingPhone}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddressLine">Address Line *</Label>
                  <Input
                    id="shippingAddressLine"
                    value={formData.shippingAddressLine}
                    onChange={(e) => setFormData({ ...formData, shippingAddressLine: e.target.value })}
                    className="mt-1"
                    placeholder="House/Flat No, Street, Building"
                    aria-invalid={!!errors.shippingAddressLine}
                  />
                  {errors.shippingAddressLine && <p className="mt-1 text-sm text-destructive">{errors.shippingAddressLine}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="shippingCity">City *</Label>
                    <Input
                      id="shippingCity"
                      value={formData.shippingCity}
                      onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                      className="mt-1"
                      placeholder="Karachi"
                      aria-invalid={!!errors.shippingCity}
                    />
                    {errors.shippingCity && <p className="mt-1 text-sm text-destructive">{errors.shippingCity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shippingArea">Area / Region *</Label>
                    <Input
                      id="shippingArea"
                      value={formData.shippingArea}
                      onChange={(e) => setFormData({ ...formData, shippingArea: e.target.value })}
                      className="mt-1"
                      placeholder="Gulshan-e-Iqbal"
                      aria-invalid={!!errors.shippingArea}
                    />
                    {errors.shippingArea && <p className="mt-1 text-sm text-destructive">{errors.shippingArea}</p>}
                  </div>
                  <div>
                    <Label htmlFor="shippingPostalCode">Postal Code</Label>
                    <Input
                      id="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                      className="mt-1"
                      placeholder="75300"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
              <div className="rounded-xl border bg-card p-6 space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      selectedPayment === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPayment === method.id}
                      onChange={() => setSelectedPayment(method.id)}
                      className="sr-only"
                    />
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <method.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{method.name}</p>
                        {method.recommended && <Badge variant="secondary" className="text-xs">Recommended</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    <div className={cn(
                      "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedPayment === method.id
                        ? "border-primary bg-primary"
                        : "border-border"
                    )}>
                      {selectedPayment === method.id && (
                        <svg className="size-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-xl font-semibold">Order Notes (Optional)</h2>
              <div className="rounded-xl border bg-card p-6">
                <Label htmlFor="customerNotes">Special Instructions</Label>
                <textarea
                  id="customerNotes"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                  className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
                  rows={3}
                  placeholder="Delivery instructions, preferred delivery time, etc."
                />
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border bg-card p-6 space-y-6">
              <div>
                <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                  {cart.items.map((item) => {
                    const image = item.product.images[0];
                    const lineTotal = item.product.price * item.quantity;
                    const hasDiscount = item.product.compareAtPrice && item.product.compareAtPrice > item.product.price;

                    return (
                      <Link key={item.id} href={`/products/${item.product.slug}`} className="flex gap-3 group">
                        <div className="h-16 w-16 shrink-0 rounded-lg border bg-muted overflow-hidden">
                          {image && <Image src={image.url} alt={image.altText ?? item.product.name} fill className="object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-sm font-semibold">{formatPrice(lineTotal)}</span>
                            {hasDiscount && <span className="text-xs line-through text-muted-foreground">{formatPrice(item.product.compareAtPrice!)}</span>}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>{deliveryFee === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {errors.form && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {errors.form}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
                {" and "}
                <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
              </p>

              <div className="border-t pt-4 space-y-3">
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
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}