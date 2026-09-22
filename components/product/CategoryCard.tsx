"use client";

import Link from "next/link";
import Image from "next/image";

import { ChevronRight } from "lucide-react";

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    _count?: { products: number };
  };
}

export function CategoryCard({ category }: CategoryCardProps) {
  const productCount = category._count?.products ?? 0;

  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group rounded-xl border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-muted transition group-hover:bg-primary group-hover:text-primary-foreground">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            width={24}
            height={24}
            className="object-contain"
          />
        ) : (
          <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>

      <h3 className="font-semibold">{category.name}</h3>

      {category.description && (
        <p className="mt-1 text-xs leading-5 text-muted-foreground line-clamp-2">
          {category.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between text-xs font-medium">
        <span className="text-muted-foreground">{productCount} product{productCount !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-1 text-primary">
          Shop now
          <ChevronRight className="size-3.5 transition group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}