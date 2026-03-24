import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import { Search, Package, MapPin } from "lucide-react";

type Item = Awaited<
  ReturnType<typeof import("@/actions/item.actions").getItems>
>["items"][number];

interface ItemCardProps {
  item: Item;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHONE: "Phone",
  KEYS: "Keys",
  WALLET: "Wallet",
  DOCUMENTS: "Documents",
  ELECTRONICS: "Electronics",
  OTHER: "Other",
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col rounded-sm transition-all hover:-translate-y-1 bg-void border border-gold/18 overflow-hidden shadow-lg"
    >
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-obsidian">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-obsidian text-slate text-4xl opacity-50">
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
            {item.type === "LOST" ? "LOST" : "FOUND"}
          </span>
          <span className="font-interface text-[10px] text-slate tracking-widest">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>

        <h3 className="font-display text-2xl font-light text-ivory leading-tight group-hover:text-gold transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between border-t border-gold/10 pt-4 mt-1">
          <div className="flex items-center gap-1.5 text-slate">
            <MapPin className="w-3 h-3 text-ivory/60" strokeWidth={2} />
            <span className="font-interface text-[11px] tracking-wide uppercase">
              {item.location}
            </span>
          </div>
          <span className="font-interface text-[11px] text-slate opacity-70">
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
