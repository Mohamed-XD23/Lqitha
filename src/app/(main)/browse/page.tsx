import { getItems } from "@/actions/item.actions";
import { ItemType } from "@prisma/client";
import { getDictionary, getLocale } from "@/lib/dictionary";
import BrowseClient from "./BrowseClient";

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
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const { items, totalPages, currentPage, totalCount } = await getItems({
    type: params.type as ItemType | undefined,
    category: params.category,
    search: params.search,
    page: params.page ? parseInt(params.page) : 1,
  });

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <BrowseClient
          dict={dict}
          items={items}
          totalPages={totalPages}
          currentPage={currentPage}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}
