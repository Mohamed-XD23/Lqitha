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

  const btnStyle = {
    fontFamily: "var(--font-outfit)",
    fontSize: "11px",
    fontWeight: 400,
    letterSpacing: "2px",
    textTransform: "uppercase" as const,
    padding: "10px 24px",
    borderRadius: "2px",
    cursor: "pointer",
    background: "transparent",
    color: "#C4A35A",
    border: "1px solid rgba(196,163,90,0.3)",
    transition: "all 0.2s",
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        style={{ ...btnStyle, opacity: currentPage === 1 ? 0.3 : 1 }}
      >
        ← السابق
      </button>
      <span
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "11px",
          letterSpacing: "2px",
          color: "#7A7A8C",
        }}
      >
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ ...btnStyle, opacity: currentPage === totalPages ? 0.3 : 1 }}
      >
        التالي →
      </button>
    </div>
  );
}
