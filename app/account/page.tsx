import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, ShoppingCart, Truck, CreditCard, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = {
  title: "My Account | ATTARI Electric & Hardware Store",
  description: "Manage your account, orders, and settings.",
};

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/account`);
  }

  const user = session.user;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Account</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name ?? "Customer"}. Manage your account and orders.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/account/orders">
            <Card className="transition hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5 text-primary" />
                  My Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  View your order history and track shipments
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">View Orders</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage your profile information
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">View Profile</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="size-5 text-primary" />
                Addresses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage shipping and billing addresses
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Manage Addresses</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-primary" />
                Saved Cart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                View and manage your saved items
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">View Cart</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage your saved payment methods
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Manage Payments</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="size-5 text-primary" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Manage your account preferences
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">Settings</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <LogoutButton />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}