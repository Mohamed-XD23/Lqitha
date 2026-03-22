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
    "font-outfit text-xs font-semibold tracking-[3px] uppercase px-8 py-3.5 rounded-[2px] cursor-pointer bg-transparent text-[#C4A35A] border border-[#C4A35A]/30 transition-all duration-300 hover:bg-[#C4A35A]/10 hover:border-[#C4A35A] disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3";

  return (
    <div className="mt-20 flex items-center justify-center gap-10">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnClass}
      >
        <i className="fa-solid fa-arrow-left text-[10px]"></i>
        Prev
      </button>

      <div className="font-outfit text-[10px] font-bold tracking-[4px] text-[#7A7A8C] uppercase">
        <span className="flex items-center gap-4">
          <span className="text-[#F2EFE8]">{currentPage}</span>
          <span className="opacity-30">/</span>
          <span>{totalPages}</span>
        </span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnClass}
      >
        Next
        <i className="fa-solid fa-arrow-right text-[10px]"></i>
      </button>
    </div>
  );
}
