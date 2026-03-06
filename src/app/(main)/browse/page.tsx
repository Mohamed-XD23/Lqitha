import { getItems } from "@/actions/item.actions";
import { ItemType } from "@/generated/prisma";
import ItemCard from "@/components/items/ItemCard";
import FilterBar from "@/components/items/FilterBar";
import Pagination from "@/components/items/Pagination";

// Next.js يمرر searchParams تلقائياً لأي Server Component في App Router
interface BrowsePageProps {
  searchParams: Promise<{
    type?: string;
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  // في Next.js 15 أصبح searchParams async
  const params = await searchParams;

  const { items, totalPages, currentPage, totalCount } = await getItems({
    type: params.type as ItemType | undefined,
    category: params.category,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">تصفح البلاغات</h1>
        <p className="mt-1 text-sm text-gray-500">
          {totalCount} بلاغ متاح
        </p>
      </div>

      {/* شريط الفلترة — Client Component */}
      <FilterBar />

      {/* قائمة البلاغات */}
      {items.length === 0 ? (
        <div className="mt-16 text-center text-gray-400">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-lg font-medium">لا توجد نتائج</p>
          <p className="text-sm">جرّب تغيير الفلاتر أو البحث بكلمة مختلفة</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}