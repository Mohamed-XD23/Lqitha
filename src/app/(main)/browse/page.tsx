import { getItems } from "@/actions/item.actions";
import { ItemType } from "@prisma/client";
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
    <div className="bg-[#080810] min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <div className="mb-14 relative">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-px w-8 bg-[#C4A35A]/40"></div>
             <span className="font-outfit text-[11px] font-semibold tracking-[4px] uppercase text-[#C4A35A]">
               Discovery
             </span>
          </div>
          <h1 className="font-cormorant text-[56px] font-light text-[#F2EFE8] leading-tight mt-2">
            Browse Items
          </h1>
          <p className="font-outfit text-sm text-[#7A7A8C] mt-4 tracking-[1px] font-light max-w-lg">
            Find what you lost or return what you found. Currently tracking <span className="text-[#C4A35A] font-medium">{totalCount} items</span> globally.
          </p>
        </div>

        {/* Filter Area */}
        <div className="mb-12">
          <FilterBar />
        </div>

        {/* Listings Grid */}
        {items.length === 0 ? (
          <div className="mt-32 text-center py-20 border border-dashed border-[#C4A35A]/10 rounded-[4px]">
             <i className="fa-solid fa-box-open text-4xl text-[#C4A35A]/20 mb-6"></i>
             <h2 className="font-cormorant text-3xl font-light text-[#F2EFE8]/70">
                No matches found
             </h2>
             <p className="font-outfit text-xs text-[#7A7A8C] mt-3 tracking-[2px] uppercase">
                Try refining your search parameters
             </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16">
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </div>
        )}
      </div>
    </div>
  );
}
