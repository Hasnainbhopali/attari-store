"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";
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


interface OwnerProductsContentProps {
  productsResult: {
    products: Array<{
      id: string;
      name: string;
      slug: string;
      sku: string;
      description: string | null;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
      lowStockThreshold: number;
      isActive: boolean;
      isFeatured: boolean;
      category: { id: string; name: string } | null;
      images: Array<{ id: string; url: string; altText: string | null; sortOrder: number }>;
      createdAt: Date;
      updatedAt: Date;
    }>;
    totalCount: number;
    totalPages: number;
    currentPage: number;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    isActive: boolean;
    parentId: string | null;
    parent: { id: string; name: string } | null;
    children: Array<{ id: string; name: string }>;
    _count: { products: number };
    createdAt: Date;
    updatedAt: Date;
  }>;
  filters: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    lowStock?: boolean;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  };
}

export function OwnerProductsContent({ productsResult, categories, filters }: OwnerProductsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/owner/products?${params.toString()}`, { scroll: false });
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

  const openDeleteDialog = (id: string) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/owner/products/${productToDelete}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete product");
      }
    } catch {
      alert("Failed to delete product");
    }
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const columns = [
    {
      key: "image",
      header: "",
      render: (product: typeof productsResult.products[0]) => (
        <Link href={`/owner/products/${product.id}`} className="block">
          <img
            src={product.images[0]?.url ?? "/placeholder.svg"}
            alt={product.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        </Link>
      ),
      className: "w-16",
    },
    {
      key: "name",
      header: "Product",
      render: (product: typeof productsResult.products[0]) => (
        <Link href={`/owner/products/${product.id}`} className="font-medium hover:text-primary">
          {product.name}
        </Link>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (product: typeof productsResult.products[0]) => <span className="font-mono text-sm">{product.sku}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (product: typeof productsResult.products[0]) => (
        <span>{product.category?.name ?? "Uncategorized"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: typeof productsResult.products[0]) => (
        <div className="flex items-baseline gap-1">
          <span className="font-semibold">
            {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm line-through text-muted-foreground">
              {new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(product.compareAtPrice)}
            </span>
          )}
        </div>
      ),
      sortable: true,
      className: "text-right",
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: typeof productsResult.products[0]) => {
        const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;
        const isOutOfStock = product.stockQuantity === 0;
        return (
          <span className={cn("font-medium", isOutOfStock ? "text-destructive" : isLowStock ? "text-orange-600" : "")}>
            {product.stockQuantity} / {product.lowStockThreshold}
          </span>
        );
      },
      sortable: true,
      className: "text-right",
    },
    {
      key: "status",
      header: "Status",
      render: (product: typeof productsResult.products[0]) => (
        <Badge variant={product.isActive ? "default" : "outline"} className="text-xs">
          {product.isActive ? "Active" : "Archived"}
        </Badge>
      ),
      sortable: false,
    },
    {
      key: "featured",
      header: "Featured",
      render: (product: typeof productsResult.products[0]) => (
        <Badge variant={product.isFeatured ? "default" : "outline"} className="text-xs">
          {product.isFeatured ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (product: typeof productsResult.products[0]) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/owner/products/${product.id}`} className="p-2 rounded-lg hover:bg-muted" title="View">
            <Eye className="size-4" />
          </Link>
          <Link href={`/owner/products/${product.id}/edit`} className="p-2 rounded-lg hover:bg-muted" title="Edit">
            <Edit className="size-4" />
          </Link>
          <button
            onClick={() => openDeleteDialog(product.id)}
            className="p-2 rounded-lg hover:bg-muted text-destructive"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
      className: "w-32 text-right",
    },
  ];

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.filter((c) => !c.parentId).map((c) => ({ value: c.id, label: c.name })),
  ];

  const filterOptions = [
    {
      key: "categoryId",
      label: "Category",
      options: categoryOptions,
    },
    {
      key: "isActive",
      label: "Status",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Active" },
        { value: "false", label: "Archived" },
      ],
    },
    {
      key: "isFeatured",
      label: "Featured",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Featured" },
        { value: "false", label: "Not Featured" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/owner/products/new">
          <Button>
            <Plus className="size-4 mr-2" />
            Add Product
          </Button>
        </Link>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={productsResult.products}
        keyExtractor={(p) => p.id}
        searchKey={["name", "sku", "description"]}
        filterOptions={filterOptions}
        sortBy={filters.sortBy}
        sortOrder={filters.sortBy?.endsWith("-desc") ? "desc" : "asc"}
        onSort={handleSort}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pagination={{
          currentPage: productsResult.currentPage,
          totalPages: productsResult.totalPages,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No products found"
      />
    </div>
  );
}