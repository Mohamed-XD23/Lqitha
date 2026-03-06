"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
    { value: "", label: "الكل" },
    { value: "PHONE", label: "هاتف" },
    { value: "KEYS", label: "مفاتيح" },
    { value: "WALLET", label: "محفظة" },
    { value: "DOCUMENTS", label: "وثائق" },
    { value: "ELECTRONICS", label: "إلكترونيات" },
    { value: "OTHER", label: "أخرى" },
];

export default function FilterBar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // دالة مساعدة لتحديث الـ URL مع الحفاظ على الفلاتر الأخرى
    const updateFilter = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
            // نرجع دائماً إلى الصفحة الأولى عند تغيير الفلتر
            params.delete("page");
            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    const currentType = searchParams.get("type") || "";
    const currentCategory = searchParams.get("category") || "";

    return (
        <div className="flex flex-col gap-4">
            {/* بحث */}
            <input
                type="text"
                placeholder="ابحث عن غرض..."
                defaultValue={searchParams.get("search") || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
            />

            {/* فلتر النوع */}
            <div className="flex gap-2">
                {[
                    { value: "", label: "الكل" },
                    { value: "LOST", label: "🔍 مفقود" },
                    { value: "FOUND", label: "📦 موجود" },
                ].map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateFilter("type", value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
              ${currentType === value
                                ? "bg-black text-white"
                                : "border border-gray-300 hover:border-black"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* فلتر الفئة */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => updateFilter("category", value)}
                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors
              ${currentCategory === value
                                ? "bg-black text-white"
                                : "border border-gray-300 hover:border-black"
                            }`}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}