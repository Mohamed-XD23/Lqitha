"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";

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
  const inactiveClass =
    "bg-transparent text-slate border-gold/20 hover:border-gold/40";

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <div className="relative group">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate/40 group-focus-within:text-gold/60 transition-colors" />
        <input
          type="text"
          placeholder="Search items..."
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="bg-void border border-gold/15 text-ivory font-interface text-sm pl-12 pr-4 py-4 rounded-xs outline-none w-full placeholder:text-slate/30 transition-all focus:border-gold/50 focus:bg-void/80 shadow-sm"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
        {/* Type Filter */}
        <div className="flex items-center gap-4">
          <span className="font-interface text-[9px] font-bold tracking-[3px] uppercase text-slate/60 mr-2">
            Status
          </span>
          <div className="flex gap-2">
            {[
              { value: "", label: "All" },
              { value: "LOST", label: "Lost" },
              { value: "FOUND", label: "Found" },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter("type", value)}
                className={`font-interface text-[10px] font-semibold tracking-xs uppercase px-6 py-2 rounded-xs cursor-pointer border transition-all duration-300 ${
                  currentType === value ? activeClass : inactiveClass
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-interface text-[9px] font-bold tracking-[3px] uppercase text-slate/60 mr-2">
            Category
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter("category", value)}
                className={`font-interface text-[10px] font-medium tracking-px px-4 py-1.5 rounded-xs cursor-pointer border transition-all duration-300 ${
                  currentCategory === value ? activeClass : inactiveClass
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
