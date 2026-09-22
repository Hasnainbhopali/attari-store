"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, ChevronDown } from "lucide-react";

interface SearchFiltersProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  initialFilters?: {
    search?: string;
    category?: string;
    sortBy?: string;
  };
}

export function SearchFilters({ categories, initialFilters = {} }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const currentSearch = searchParams.get("search") ?? initialFilters.search ?? "";
  const currentCategory = searchParams.get("category") ?? initialFilters.category ?? "";
  const currentSort = searchParams.get("sort") ?? initialFilters.sortBy ?? "newest";

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      params.delete("page");
      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      updateFilters({ search: value || undefined });
    },
    [updateFilters]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateFilters({ category: value || undefined });
    },
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      updateFilters({ sort: value });
    },
    [updateFilters]
  );

  const clearFilters = useCallback(() => {
    updateFilters({ search: undefined, category: undefined });
  }, [updateFilters]);

  const hasActiveFilters = currentSearch || currentCategory;

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search products..."
          value={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-10 w-full rounded-lg border bg-muted/40 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
        />
        {currentSearch && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <Button
        variant="outline"
        className={cn("w-full justify-between", isFilterOpen && "border-primary")}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
        <Filter className="size-4 mr-2" />
        Filters
        <ChevronDown className={cn("size-4 transition-transform", isFilterOpen && "rotate-180")} />
      </Button>

      {isFilterOpen && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
          <div>
            <Label className="block text-sm font-medium mb-2">Category</Label>
            <select
              value={currentCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-10 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-2">Sort By</Label>
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-10 rounded-lg border bg-muted/40 px-3 py-2 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/10"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="w-full" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium", className)} {...props}>{children}</label>;
}