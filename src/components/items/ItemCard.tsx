import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

// نستخدم Awaited و ReturnType لاستخراج نوع البيانات من دالة getItems
// بدلاً من تعريف Type جديد يدوياً
type Item = Awaited<ReturnType<typeof import("@/actions/item.actions").getItems>>["items"][number];

interface ItemCardProps {
    item: Item;
}

const CATEGORY_LABELS: Record<string, string> = {
    PHONE: "هاتف", KEYS: "مفاتيح", WALLET: "محفظة",
    DOCUMENTS: "وثائق", ELECTRONICS: "إلكترونيات", OTHER: "أخرى",
};

export default function ItemCard({ item }: ItemCardProps) {
    return (
        <Link href={`/items/${item.id}`}
            className="group flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">

            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-bold
          ${item.type === "LOST"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}>
                    {item.type === "LOST" ? "🔍 مفقود" : "📦 موجود"}
                </span>
                <span className="text-xs text-gray-400">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                </span>
            </div>

            {/* Title & Description */}
            <h3 className="font-semibold text-gray-900 group-hover:underline">
                {item.title}
            </h3>

            {/* Footer */}
            <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-400">
                <span>📍 {item.location}</span>
                <span>{formatDate(item.date)}</span>
            </div>
        </Link>
    );
}