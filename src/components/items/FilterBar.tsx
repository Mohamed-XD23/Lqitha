"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "", label: "All" },
  { value: "PHONE", label: "Phone" },
  { value: "KEYS", label: "Keys" },
  { value: "WALLET", label: "Wallet" },
  { value: "DOCUMENTS", label: "Documents" },
  { value: "ELECTRONICS", label: "Electronics" },
  { value: "OTHER", label: "Other" },
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

  const activeClass = "bg-gold text-obsidian border-gold";
  const inactiveClass = "bg-transparent text-slate border-gold/20";

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => updateFilter("search", e.target.value)}
        className="bg-void/80 border border-gold/18 text-ivory/60 font-outfit text-base px-4 py-3 rounded-lg outline-none w-full placeholder:text-slate/50 transition-colors focus:border-gold/30"
      />

      {/* Type Filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "All" },
          { value: "LOST", label: "Lost" },
          { value: "FOUND", label: "Found" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateFilter("type", value)}
            className={`font-outfit text-[11px] font-medium tracking-[2px] uppercase px-4 py-2 rounded-lg cursor-pointer border transition-all duration-200 ${
              currentType === value ? activeClass : inactiveClass
            }`}
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
            className={`font-outfit text-[11px] font-normal tracking-wider px-3.5 py-1.5 rounded-[10px] cursor-pointer border transition-all duration-200 ${
              currentCategory === value ? activeClass : inactiveClass
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
