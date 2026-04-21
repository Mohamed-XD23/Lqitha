"use client";

import type { Dictionary } from "@/lib/dictionary.types";
import FilterBar from "@/components/items/FilterBar";
import Pagination from "@/components/items/Pagination";
import ItemCard from "@/components/items/ItemCard";
import { PackageOpen, List, Map } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";

const BrowseMap = dynamic(() => import("@/components/ui/BrowseMap"), {
  ssr: false,
  loading: () => (
    <div className="h-150 bg-card border border-primary/15 rounded-xl flex items-center justify-center">
      <span className="text-muted-foreground text-sm font-interface animate-pulse">
        Loading map...
      </span>
    </div>
  ),
});

type Item = Awaited<
  ReturnType<typeof import("@/actions/item.actions").getItems>
>["items"][number];

interface BrowseClientProps {
  dict: Dictionary;
  items: Item[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export default function BrowseClient({
  dict,
  items,
  totalPages,
  currentPage,
  totalCount,
}: BrowseClientProps) {
  const t = dict.browse;
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  return (
    <>
      {/* Header */}
      <div className="mb-14 relative">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <svg width="24" height="34" viewBox="0 0 261.42 370" fill="none">
            <path
              d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z"
              fill="#C4A35A"
            />
            <path
              d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
              fill="#7A7A8C"
            />
          </svg>
          <span className="font-fraunces text-3xl font-light tracking-sm text-foreground">
            LQITHA
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8 bg-primary/40"></div>
          <span className="font-interface text-xs font-semibold tracking-sm uppercase text-primary">
            {t.badge}
          </span>
        </div>
        <h1 className="font-display text-[56px] font-light text-foreground leading-tight mt-2">
          {t.title}
        </h1>
        <p className="font-interface text-sm text-muted-foreground mt-4 tracking-px font-light max-w-lg">
          {t.subtitle}{" "}
          <span className="text-primary font-medium">
            {totalCount} {t.itemsLabel}
          </span>{" "}
          {t.subtitleSuffix}
        </p>
      </div>

      {/* Filter Area + View Toggle */}
      <div className="mb-12 flex items-start justify-between gap-4">
        <div className="flex-1">
          <FilterBar dict={dict} />
        </div>
        {/* View Toggle */}
        <div className="flex items-center bg-card border border-primary/15 rounded-lg p-1 shrink-0 mt-0.5">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-interface font-medium transition-all ${
              viewMode === "list"
                ? "bg-primary text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="" />
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-interface font-medium transition-all ${
              viewMode === "map"
                ? "bg-primary text-background"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Map></Map>
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {viewMode === "map" ? (
        <BrowseMap items={items} />
      ) : items.length === 0 ? (
        <div className="mt-32 text-center py-20 border border-dashed border-border rounded-sm">
          <PackageOpen
            className="w-12 h-12 text-primary/20 mx-auto mb-6"
            strokeWidth={1}
          />
          <h2 className="font-display text-3xl font-light text-foreground/70">
            {t.emptyTitle}
          </h2>
          <p className="font-interface text-xs text-muted-foreground mt-3 tracking-xs uppercase">
            {t.emptySubtitle}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} dict={dict} />
          ))}
        </div>
      )}

      {viewMode === "list" && totalPages > 1 && (
        <div className="mt-16">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            dict={dict}
          />
        </div>
      )}
    </>
  );
}
