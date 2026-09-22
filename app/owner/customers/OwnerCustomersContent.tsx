"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Search, Filter, ChevronLeft, ChevronRight, User, Package, DollarSign, ExternalLink } from "lucide-react";
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

interface OwnerCustomersContentProps {
  customersResult: {
    customers: Array<{
      id: string;
      name: string | null;
      email: string;
      phone: string | null;
      image: string | null;
      role: string;
      createdAt: Date;
      _count: { orders: number; addresses: number };
      totalSpent: number;
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  filters: {
    search?: string;
    hasOrders?: boolean;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  };
}

export function OwnerCustomersContent({ customersResult, filters }: OwnerCustomersContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/owner/customers?${params.toString()}`, { scroll: false });
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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (customer: typeof customersResult.customers[0]) => (
        <Link href={`/owner/customers/${customer.id}`} className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {customer.image ? (
              <img src={customer.image} alt="" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <svg className="size-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-medium">{customer.name ?? "Guest"}</p>
            <p className="text-sm text-muted-foreground">{customer.email}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (customer: typeof customersResult.customers[0]) => (
        <span>{customer.phone ?? "—"}</span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (customer: typeof customersResult.customers[0]) => (
        <Badge variant="outline" className="text-xs">{customer._count.orders}</Badge>
      ),
      sortable: true,
      className: "text-center",
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (customer: typeof customersResult.customers[0]) => (
        <span className="font-semibold">{formatPrice(customer.totalSpent)}</span>
      ),
      sortable: true,
      className: "text-right",
    },
    {
      key: "joined",
      header: "Joined",
      render: (customer: typeof customersResult.customers[0]) => (
        <span className="text-sm text-muted-foreground">{format(new Date(customer.createdAt), "MMM d, yyyy")}</span>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "",
      render: (customer: typeof customersResult.customers[0]) => (
        <Link href={`/owner/customers/${customer.id}`} className="text-primary hover:underline text-sm">
          View Details
        </Link>
      ),
      className: "w-32 text-right",
    },
  ];

  const filterOptions = [
    {
      key: "hasOrders",
      label: "Has Orders",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Has Orders" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage customer accounts and view order history</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={customersResult.customers}
        keyExtractor={(c) => c.id}
        searchKey={["name", "email", "phone"]}
        filterOptions={filterOptions}
        sortBy={filters.sortBy}
        sortOrder={filters.sortBy?.endsWith("-desc") ? "desc" : "asc"}
        onSort={handleSort}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pagination={{
          currentPage: customersResult.currentPage,
          totalPages: customersResult.totalPages,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No customers found"
      />
    </div>
  );
}