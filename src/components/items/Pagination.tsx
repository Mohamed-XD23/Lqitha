"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  const btnClass =
    "font-outfit text-[11px] font-normal tracking-[2px] uppercase px-6 py-2.5 rounded-md cursor-pointer bg-transparent text-gold border-2 border-gold/30 transition-all duration-200 hover:scale-105 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed";

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnClass}
      >
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-angles-left"></i>
          Previous
        </div>
      </button>
      <div className="font-outfit text-[11px] tracking-[2px] text-slate">
        <span className="text-slate flex items-center gap-2">
          Page
          <span>
            {currentPage} / {totalPages}
          </span>
        </span>
      </div>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnClass}
      >
        <div className="flex items-center gap-2">
          Next
          <i className="fa-solid fa-angles-right"></i>
        </div>
      </button>
    </div>
  );
}
