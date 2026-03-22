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
      className="group flex flex-col rounded-[4px] transition-all hover:-translate-y-1 bg-[#13131F] border border-[#C4A35A]/18 overflow-hidden shadow-lg"
    >
      {/* Image */}
      <div className="aspect-video w-full overflow-hidden bg-[#080810]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#080810] text-[#7A7A8C] text-4xl opacity-50">
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
            className={`font-outfit text-[9px] font-medium tracking-[2px] uppercase px-2.5 py-1 rounded-[2px] border ${
              item.type === "LOST"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}
          >
            {item.type === "LOST" ? "LOST" : "FOUND"}
          </span>
          <span className="font-outfit text-[10px] text-[#7A7A8C] tracking-widest">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>

        <h3 className="font-cormorant text-2xl font-light text-[#F2EFE8] leading-tight group-hover:text-[#C4A35A] transition-colors">
          {item.title}
        </h3>

        <div className="flex items-center justify-between border-t border-[#C4A35A]/10 pt-4 mt-1">
          <div className="flex items-center gap-1.5 text-[#7A7A8C]">
            <i className="fa-solid fa-location-dot text-[10px] text-[#C4A35A]/60" />
            <span className="font-outfit text-[11px] tracking-wide uppercase">
              {item.location}
            </span>
          </div>
          <span className="font-outfit text-[11px] text-[#7A7A8C] opacity-70">
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
