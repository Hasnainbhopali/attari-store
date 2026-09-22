"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./AdminSidebar";
import { X, Menu, Bell, User, LogOut, ChevronDown, LayoutDashboard, Package, Tags, ShoppingCart, Boxes, Users, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />

      <div
        className={cn(
          "min-h-screen transition-all duration-200",
          isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <header className="sticky top-0 z-30 h-16 bg-background/95 backdrop-blur border-b">
          <div className="mx-auto flex h-full max-w-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
                aria-label="Open menu"
              >
                <Menu className="size-6" />
              </button>
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 rounded-lg hover:bg-muted"
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isSidebarCollapsed ? <ChevronDown className="size-5 rotate-180" /> : <Menu className="size-5" />}
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-muted" aria-label="Notifications">
                <Bell className="size-5" />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
                  3
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted"
                  aria-label="User menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="" className="h-8 w-8 rounded-full" />
                    ) : (
                      <User className="size-5 text-primary" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{session?.user?.name ?? "Owner"}</span>
                  <ChevronDown className="size-4" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card py-2 shadow-lg z-50">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">{session?.user?.name ?? "Owner"}</p>
                        <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                      </div>
                      <Link
                        href="/owner/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="size-4" />
                        Profile
                      </Link>
                      <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <X className="size-4" />
                        View Store
                      </Link>
                      <button
                        onClick={() => signOut({ callbackUrl: "/api/auth/signin" })}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-muted"
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 z-50 h-full w-64 bg-background border-r lg:hidden">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/owner" className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <LayoutDashboard className="size-5" />
                </div>
                <span className="font-bold text-lg">ATTARI Admin</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-muted" aria-label="Close menu">
                <X className="size-6" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="size-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

const navigation = [
  { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { name: "Products", href: "/owner/products", icon: Package },
  { name: "Categories", href: "/owner/categories", icon: Tags },
  { name: "Orders", href: "/owner/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/owner/inventory", icon: Boxes },
  { name: "Customers", href: "/owner/customers", icon: Users },
  { name: "Settings", href: "/owner/settings", icon: Settings },
];