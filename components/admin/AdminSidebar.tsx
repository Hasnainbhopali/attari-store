"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Boxes,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
  { name: "Products", href: "/owner/products", icon: Package },
  { name: "Categories", href: "/owner/categories", icon: Tags },
  { name: "Orders", href: "/owner/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/owner/inventory", icon: Boxes },
  { name: "Customers", href: "/owner/customers", icon: Users },
  { name: "Settings", href: "/owner/settings", icon: Settings },
];

export function AdminSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card border-r transition-all duration-200",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Admin navigation"
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link href="/owner" className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="size-5" />
              </div>
              <span className="font-bold text-lg">ATTARI Admin</span>
            </Link>
          )}
          <button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-lg hover:bg-muted transition-colors",
              isCollapsed && "ml-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-2"
                )}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="size-5 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "View Store" : undefined}
          >
            <Package className="size-5 shrink-0" />
            {!isCollapsed && <span>View Store</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}