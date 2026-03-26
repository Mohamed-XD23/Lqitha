"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  dict: Dictionary;
}

export default function Pagination({
  currentPage,
  totalPages,
  dict,
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = dict.browse;

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  }

  const btnClass =
    "font-interface text-xs font-semibold tracking-[3px] uppercase px-8 py-3.5 rounded-xs cursor-pointer bg-transparent text-gold border border-gold/30 transition-all duration-300 hover:bg-gold/10 hover:border-gold disabled:opacity-20 disabled:cursor-not-allowed flex items-center gap-3";

  return (
    <div className="mt-20 flex items-center justify-center gap-10">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={btnClass}
      >
        <ArrowLeft className="w-3 h-3" strokeWidth={2.5} />
        {t.prev}
      </button>

      <div className="font-interface text-xs font-bold tracking-sm text-slate uppercase">
        <span className="flex items-center gap-4">
          <span className="text-ivory">{currentPage}</span>
          <span className="opacity-30">/</span>
          <span>{totalPages}</span>
        </span>
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={btnClass}
      >
        {t.next}
        <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}
