import ItemCardSkeleton from "@/components/items/ItemCardSkeleton";

export default function BrowseLoading() {
  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header skeleton */}
        <div className="mb-10 animate-pulse">
          <div className="h-3 w-20 rounded-full bg-gold/10 mb-3" />
          <div className="h-10 w-72 rounded-full bg-gold/10 mb-3" />
          <div className="h-3 w-32 rounded-full bg-gold/10" />
        </div>

        {/* FilterBar skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-10 w-full rounded-xl bg-gold/10" />
        </div>

        {/* Item grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ItemCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
