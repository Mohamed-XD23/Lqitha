"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Search } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

interface FilterBarProps {
  dict: Dictionary;
}

export default function FilterBar({ dict }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = dict.browse;

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

  const CATEGORIES = [
    { value: "", label: t.all },
    { value: "PHONE", label: t.categories.PHONE },
    { value: "KEYS", label: t.categories.KEYS },
    { value: "WALLET", label: t.categories.WALLET },
    { value: "DOCUMENTS", label: t.categories.DOCUMENTS },
    { value: "ELECTRONICS", label: t.categories.ELECTRONICS },
    { value: "OTHER", label: t.categories.OTHER },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Search */}
      <div className="relative group">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate/40 group-focus-within:text-gold/60 transition-colors rtl:left-auto rtl:right-4" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          defaultValue={searchParams.get("search") || ""}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="bg-void border border-gold/15 text-ivory font-interface text-sm ltr:pl-12 ltr:pr-4 rtl:pr-12 rtl:pl-4 py-4 rounded-xs outline-none w-full placeholder:text-slate/30 transition-all focus:border-gold/50 focus:bg-void/80 shadow-sm"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
        {/* Type Filter */}
        <div className="flex items-center gap-4">
          <span className="font-interface text-xs font-bold tracking-[3px] uppercase text-slate/60 ltr:mr-2 rtl:ml-2">
            {t.statusLabel}
          </span>
          <div className="flex gap-2">
            {[
              { value: "", label: t.all },
              { value: "LOST", label: t.lost },
              { value: "FOUND", label: t.found },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter("type", value)}
                className={`font-interface text-xs font-semibold tracking-xs uppercase px-6 py-2 rounded-xs cursor-pointer border transition-all duration-300 ${
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
          <span className="font-interface text-xs font-bold tracking-[3px] uppercase text-slate/60 ltr:mr-2 rtl:ml-2">
            {t.categoryLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => updateFilter("category", value)}
                className={`font-interface text-xs font-medium tracking-px px-4 py-1.5 rounded-xs cursor-pointer border transition-all duration-300 ${
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
