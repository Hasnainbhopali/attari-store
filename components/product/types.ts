export interface ProductCardProps {
  product: {
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
    images: Array<{
      id: string;
      url: string;
      altText: string | null;
      sortOrder: number;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  variant?: "grid" | "list";
}

export interface ProductGridProps {
  products: ProductCardProps["product"][];
  variant?: "grid" | "list";
  className?: string;
}

export interface ProductSkeletonProps {
  variant?: "grid" | "list";
  count?: number;
}