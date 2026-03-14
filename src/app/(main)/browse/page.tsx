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
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "15px",
              fontWeight: 500,
              letterSpacing: "4px",
              textTransform: "uppercase",
              color: "#C4A35A",
            }}
          >
            المنصة
          </span>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "48px",
              fontWeight: 300,
              color: "#F2EFE8",
              lineHeight: 1,
              marginTop: "8px",
            }}
          >
            تصفح البلاغات
          </h1>
          <p
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "14px",
              color: "#7A7A8C",
              marginTop: "8px",
              letterSpacing: "1px",
            }}
          >
            {totalCount} بلاغ متاح
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <FilterBar />
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="mt-20 text-center">
            <p
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "32px",
                fontWeight: 300,
                color: "#7A7A8C",
              }}
            >
              لا توجد نتائج
            </p>
            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "12px",
                color: "#7A7A8C",
                marginTop: "8px",
                letterSpacing: "1px",
              }}
            >
              جرّب تغيير الفلاتر أو البحث بكلمة مختلفة
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
