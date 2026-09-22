"use client";

import { cn } from "@/lib/utils";

export function ProductSkeleton({ variant = "grid" }: { variant?: "grid" | "list" }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border bg-card transition",
        variant === "list" && "flex flex-row items-stretch"
      )}
    >
      <div
        className={cn(
          "relative aspect-square bg-muted animate-pulse shrink-0",
          variant === "grid" ? "w-full" : "w-48"
        )}
      />

      <div className={cn("p-4 flex flex-col", variant === "list" && "flex-1 justify-between")}>
        <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
        <div className="mt-2 h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="mt-2 h-4 w-1/2 bg-muted animate-pulse rounded" />

        <div className="mt-4 flex items-center gap-2">
          <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          {variant === "list" && (
            <div className="ml-auto h-8 w-24 bg-muted animate-pulse rounded" />
          )}
        </div>
      </div>
    </div>
  );
}