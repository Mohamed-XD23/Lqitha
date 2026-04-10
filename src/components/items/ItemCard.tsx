import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { Search, Package, MapPin } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

type Item = Awaited<
  ReturnType<typeof import("@/actions/item.actions").getItems>
>["items"][number];

interface ItemCardProps {
  item: Item;
  dict: Dictionary;
}

export default function ItemCard({ item, dict }: ItemCardProps) {
  const t = dict.browse;

  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col rounded-sm transition-all hover:-translate-foreground-y-1 bg-card border border-primary/18 overflow-hidden shadow-lg"
    >
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-background">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-background text-muted-foreground text-4xl opacity-50">
            {item.type === "LOST" ? (
              <Search className="w-8 h-8" strokeWidth={1.5} />
            ) : (
              <Package className="w-8 h-8" strokeWidth={1.5} />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span
            className={`font-interface text-[9px] font-medium tracking-xs uppercase px-2.5 py-1 rounded-xs border ${
              item.type === "LOST"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}
          >
            {item.type === "LOST" ? t.lost : t.found}
          </span>
          <span className="font-interface text-xs text-muted-foreground tracking-widest">
            {t.categories[item.category as keyof typeof t.categories] ?? item.category}
          </span>
        </div>

        <h3 className="font-display text-2xl font-light text-foreground leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between border-t border-border pt-4 mt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3 text-foreground/60" strokeWidth={2} />
            <span className="font-interface text-[11px] tracking-wide uppercase">
              {item.location}
            </span>
          </div>
          <span className="font-interface text-[11px] text-muted-foreground opacity-70">
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
