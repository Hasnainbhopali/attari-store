import Image from "next/image";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-6 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl border bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-20 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
              <div className="h-20 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
              <div className="h-20 w-20 rounded-lg bg-muted animate-pulse shrink-0" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-10 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-10 w-1/2 bg-muted animate-pulse rounded" />
            <div className="flex items-baseline gap-3">
              <div className="h-8 w-32 bg-muted animate-pulse rounded" />
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-12 w-full bg-muted animate-pulse rounded" />
            <div className="h-12 w-full bg-muted animate-pulse rounded" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}