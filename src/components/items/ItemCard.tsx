import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

type Item = Awaited<
  ReturnType<typeof import("@/actions/item.actions").getItems>
>["items"][number];

interface ItemCardProps {
  item: Item;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHONE: "هاتف",
  KEYS: "مفاتيح",
  WALLET: "محفظة",
  DOCUMENTS: "وثائق",
  ELECTRONICS: "إلكترونيات",
  OTHER: "أخرى",
};

export default function ItemCard({ item }: ItemCardProps) {
  return (
    <Link
      href={`/items/${item.id}`}
      className="group flex flex-col rounded-sm transition-all hover:-translate-y-1"
      style={{
        background: "#13131F",
        border: "1px solid rgba(196,163,90,0.18)",
      }}
    >
      {/* Image */}
      <div
        className="aspect-video w-full overflow-hidden"
        style={{ background: "#0F0F1A" }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ color: "#7A7A8C", fontSize: "32px" }}
          >
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
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "9px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              padding: "4px 10px",
              borderRadius: "40px",
              background:
                item.type === "LOST"
                  ? "rgba(200,100,100,0.08)"
                  : "rgba(100,200,130,0.08)",
              color: item.type === "LOST" ? "#D48080" : "#7DC99A",
              border:
                item.type === "LOST"
                  ? "1px solid rgba(200,100,100,0.2)"
                  : "1px solid rgba(100,200,130,0.2)",
            }}
          >
            {item.type === "LOST" ? "مفقود" : "موجود"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              color: "#7A7A8C",
              letterSpacing: "1px",
            }}
          >
            {CATEGORY_LABELS[item.category] ?? item.category}
          </span>
        </div>

        <h3
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "20px",
            fontWeight: 400,
            color: "#F2EFE8",
            lineHeight: 1.2,
          }}
        >
          {item.title}
        </h3>

        <div
          className="flex items-center justify-between"
          style={{
            borderTop: "1px solid rgba(196,163,90,0.1)",
            paddingTop: "12px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "11px",
              color: "#7A7A8C",
            }}
          >
            <i className="fa-solid fa-location-dot mr-1" /> {item.location}
          </span>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "11px",
              color: "#7A7A8C",
            }}
          >
            {formatDate(item.date)}
          </span>
        </div>
      </div>
    </Link>
  );
}
