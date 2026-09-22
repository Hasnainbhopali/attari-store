"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, ChevronLeft, ChevronRight, Plus, Minus, RefreshCw } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface OwnerInventoryContentProps {
  inventoryResult: {
    products: Array<{
      id: string;
      name: string;
      sku: string;
      price: number;
      stockQuantity: number;
      lowStockThreshold: number;
      isActive: boolean;
      category: { id: string; name: string } | null;
      _count: { inventoryMovements: number };
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
    lowStock?: boolean;
    outOfStock?: boolean;
    categoryId?: string;
    sortBy?: string;
    page?: number;
    pageSize?: number;
  };
}

export function OwnerInventoryContent({ inventoryResult, categories, filters }: OwnerInventoryContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof inventoryResult.products[0] | null>(null);
  const [adjustmentQty, setAdjustmentQty] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentType, setAdjustmentType] = useState<"IN" | "OUT_SALE" | "IN_RETURN" | "ADJUSTMENT" | "DAMAGED">("ADJUSTMENT");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const updateFilters = (newFilters: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/owner/inventory?${params.toString()}`, { scroll: false });
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
    const currentSort = searchParams.get("sortBy") || "stock-asc";
    const newSort = currentSort === key ? `${key}-desc` : key;
    updateFilters({ sortBy: newSort });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page: page.toString() });
  };

  const openAdjustDialog = (product: typeof inventoryResult.products[0]) => {
    setSelectedProduct(product);
    setAdjustmentQty("");
    setAdjustmentReason("");
    setAdjustmentType("ADJUSTMENT");
    setAdjustDialogOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedProduct || !adjustmentQty) return;
    setIsAdjusting(true);
    try {
      const res = await fetch("/api/owner/inventory/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          quantityChange: parseInt(adjustmentQty),
          reason: adjustmentReason,
          type: adjustmentType,
        }),
      });
      if (res.ok) {
        toast({ title: "Stock adjusted successfully" });
        router.refresh();
        setAdjustDialogOpen(false);
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to adjust stock", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to adjust stock", variant: "destructive" });
    } finally {
      setIsAdjusting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price);

  const columns = [
    {
      key: "name",
      header: "Product",
      render: (product: typeof inventoryResult.products[0]) => (
        <Link href={`/owner/products/${product.id}`} className="font-medium hover:text-primary">
          {product.name}
        </Link>
      ),
    },
    {
      key: "sku",
      header: "SKU",
      render: (product: typeof inventoryResult.products[0]) => <span className="font-mono text-sm">{product.sku}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (product: typeof inventoryResult.products[0]) => (
        <span>{product.category?.name ?? "Uncategorized"}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (product: typeof inventoryResult.products[0]) => (
        <span className="font-semibold">{formatPrice(product.price)}</span>
      ),
      className: "text-right",
    },
    {
      key: "stock",
      header: "Stock",
      render: (product: typeof inventoryResult.products[0]) => {
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
      render: (product: typeof inventoryResult.products[0]) => (
        <Badge variant={product.isActive ? "default" : "outline"} className="text-xs">
          {product.isActive ? "Active" : "Archived"}
        </Badge>
      ),
    },
    {
      key: "movements",
      header: "Movements",
      render: (product: typeof inventoryResult.products[0]) => (
        <Badge variant="outline" className="text-xs">{product._count.inventoryMovements}</Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (product: typeof inventoryResult.products[0]) => (
        <div className="flex items-center justify-end gap-1">
          <Link href={`/owner/products/${product.id}`} className="p-2 rounded-lg hover:bg-muted" title="Edit Product">
            <RefreshCw className="size-4" />
          </Link>
          <button
            onClick={() => openAdjustDialog(product)}
            className="p-2 rounded-lg hover:bg-muted"
            title="Adjust Stock"
          >
            <Plus className="size-4" />
          </button>
        </div>
      ),
      className: "w-24 text-right",
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
      key: "lowStock",
      label: "Low Stock",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Low Stock Only" },
      ],
    },
    {
      key: "outOfStock",
      label: "Out of Stock",
      options: [
        { value: "", label: "All" },
        { value: "true", label: "Out of Stock Only" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">Monitor and manage product stock levels</p>
        </div>
      </div>

      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Stock</DialogTitle>
            <DialogDescription>
              Adjust stock for {selectedProduct?.name} (Current: {selectedProduct?.stockQuantity})
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleAdjust(); }}>
            <div className="grid gap-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Adjustment Type</label>
                <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as typeof adjustmentType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IN">Stock In</SelectItem>
                    <SelectItem value="OUT_SALE">Sale</SelectItem>
                    <SelectItem value="IN_RETURN">Return</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity Change *</label>
                <Input
                  type="number"
                  value={adjustmentQty}
                  onChange={(e) => setAdjustmentQty(e.target.value)}
                  placeholder="Use negative for reduction (e.g., -5)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <Input
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Reason for adjustment"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isAdjusting}>
                {isAdjusting ? "Adjusting..." : "Adjust Stock"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable
        columns={columns}
        data={inventoryResult.products}
        keyExtractor={(p) => p.id}
        searchKey={["name", "sku"]}
        filterOptions={filterOptions}
        sortBy={filters.sortBy}
        sortOrder={filters.sortBy?.endsWith("-desc") ? "desc" : "asc"}
        onSort={handleSort}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pagination={{
          currentPage: inventoryResult.currentPage,
          totalPages: inventoryResult.totalPages,
          onPageChange: handlePageChange,
        }}
        emptyMessage="No products found"
        rowClassName={(product) => {
          if (product.stockQuantity === 0) return "bg-destructive/5";
          if (product.stockQuantity <= product.lowStockThreshold) return "bg-orange-50/50 dark:bg-orange-900/10";
          return "";
        }}
      />
    </div>
  );
}