import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

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
      className="group flex flex-col rounded-xl transition-all hover:-translate-y-1 bg-void border border-gold/18"
    >
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-obsidian">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity hover:scale-110 rounded-t-xl"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-obsidian rounded-xl text-slate text-4xl">
            {item.type === "LOST" ? (
              <i className="fa-solid fa-magnifying-glass" />
            ) : (
              <i className="fa-solid fa-box" />
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between">
          <span
            className={`font-outfit text-[9px] font-medium tracking-[2px] uppercase px-2.5 py-1 rounded-full border ${
              item.type === "LOST"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}
          >
            {item.type === "LOST" ? "LOST" : "FOUND"}
          </span>
          <span className="font-outfit text-[10px] text-slate tracking-wider">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>

        <h3 className="font-cormorant text-2xl font-normal text-ivory leading-tight">
          {item.title}
        </h3>

        <div className="flex items-center justify-between border-t border-gold/10 pt-3 mt-1">
          <span className="font-outfit text-xs text-slate">
            <i className="fa-solid fa-location-dot mr-1" /> {item.location}
          </span>
          <span className="font-outfit text-xs text-slate">
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
