"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="mt-10 flex items-center justify-center gap-2">
            <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
            >
                ← السابق
            </button>

            <span className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
            </span>

            <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
            >
                التالي →
            </button>
        </div>
    );
}