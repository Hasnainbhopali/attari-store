import { Metadata } from "next";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Settings | ATTARI Admin",
  description: "Admin settings",
};

export const dynamic = "force-dynamic";

export default function OwnerSettingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your store settings</p>
        </div>

        <section className="rounded-xl border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold">Store Information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input type="text" defaultValue="ATTARI Electric & Hardware Store" className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Email</label>
              <input type="email" defaultValue="admin@attari.com" className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Phone</label>
              <input type="tel" defaultValue="+92 300 1234567" className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Address</label>
              <textarea defaultValue="123 Main Street, Karachi, Pakistan" rows={3} className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold">Shipping Settings</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Free Shipping Threshold (PKR)</label>
              <input type="number" defaultValue="5000" className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Standard Delivery Fee (PKR)</label>
              <input type="number" defaultValue="200" className="mt-1 w-full rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary" />
            </div>
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <div className="space-y-3">
            {["COD", "JAZZCASH", "EASYPAISA", "BANK_TRANSFER"].map((method) => (
              <label key={method} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" />
                <span className="font-medium capitalize">{method.toLowerCase().replace("_", " ")}</span>
              </label>
            ))}
          </div>
          <Button>Save Changes</Button>
        </section>

        <section className="rounded-xl border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold">Email Notifications</h2>
          <div className="space-y-3">
            {["New Order", "Order Confirmed", "Order Shipped", "Order Delivered", "Low Stock Alert"].map((notification) => (
              <label key={notification} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input" />
                <span className="font-medium">{notification}</span>
              </label>
            ))}
          </div>
          <Button>Save Changes</Button>
        </section>
      </div>
    </AdminLayout>
  );
}