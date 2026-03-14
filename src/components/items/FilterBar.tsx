"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "", label: "الكل" },
  { value: "PHONE", label: "هاتف" },
  { value: "KEYS", label: "مفاتيح" },
  { value: "WALLET", label: "محفظة" },
  { value: "DOCUMENTS", label: "وثائق" },
  { value: "ELECTRONICS", label: "إلكترونيات" },
  { value: "OTHER", label: "أخرى" },
];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";

  const activeStyle = {
    background: "#C4A35A",
    color: "#080810",
    border: "1px solid #C4A35A",
  };
  const inactiveStyle = {
    background: "transparent",
    color: "#7A7A8C",
    border: "1px solid rgba(196,163,90,0.2)",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        placeholder="ابحث عن غرض..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        style={{
          background: "#13131F",
          border: "1px solid rgba(196,163,90,0.18)",
          color: "#F2EFE8",
          fontFamily: "var(--font-outfit)",
          fontSize: "14px",
          padding: "12px 16px",
          borderRadius: "2px",
          outline: "none",
          width: "100%",
        }}
      />

      {/* Type Filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "الكل" },
          { value: "LOST", label: "مفقود" },
          { value: "FOUND", label: "موجود" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter("type", value)}
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "8px 16px",
              borderRadius: "2px",
              cursor: "pointer",
              transition: "all 0.2s",
              ...(currentType === value ? activeStyle : inactiveStyle),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter("category", value)}
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "12px",
              fontWeight: 400,
              letterSpacing: "1px",
              padding: "6px 14px",
              borderRadius: "2px",
              cursor: "pointer",
              transition: "all 0.2s",
              ...(currentCategory === value ? activeStyle : inactiveStyle),
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
