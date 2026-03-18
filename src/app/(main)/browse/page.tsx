import { getItems } from "@/actions/item.actions";
import { ItemType } from "@/generated/prisma";
import ItemCard from "@/components/items/ItemCard";
import FilterBar from "@/components/items/FilterBar";
import Pagination from "@/components/items/Pagination";

interface BrowsePageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const { items, totalPages, currentPage, totalCount } = await getItems({
    type: params.type as ItemType | undefined,
    category: params.category,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span className="font-outfit text-[15px] font-medium tracking-[4px] uppercase text-gold">
            Platform
          </span>
          <h1 className="font-cormorant text-[44px] font-light text-ivory leading-none mt-2">
            Browse Announcements
          </h1>
          <p className="font-outfit text-[14px] text-slate mt-2 tracking-wider">
            {totalCount} Announcements available
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="mt-20 text-center ">
            <p className="font-cormorant text-3xl font-light text-slate">
              No results found
            </p>
            <p className="font-outfit text-xs text-slate mt-2 tracking-wider">
              Try changing the filters or search with a different word
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
