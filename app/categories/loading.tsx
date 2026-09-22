export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="h-10 w-64 bg-muted animate-pulse rounded mx-auto" />
          <div className="mt-4 h-6 w-96 bg-muted animate-pulse rounded mx-auto" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}