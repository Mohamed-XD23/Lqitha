import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import ClaimButton from "@/components/items/ClaimButton";
import Link from "next/link";

interface ItemPageProps {
    params: Promise<{ id: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
    PHONE: "هاتف", KEYS: "مفاتيح", WALLET: "محفظة",
    DOCUMENTS: "وثائق", ELECTRONICS: "إلكترونيات", OTHER: "أخرى",
};

export default async function ItemPage({ params }: ItemPageProps) {
    const { id } = await params;

    // نجلب البيانات والـ session بالتوازي لتوفير الوقت
    const [item, session] = await Promise.all([
        getItemById(id),
        auth(),
    ]);

    // إذا لم يوجد البلاغ نعرض 404
    if (!item) return notFound();

    const isOwner = session?.user?.id === item.user.id;
    const isLoggedIn = !!session?.user;

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-sm font-bold
          ${item.type === "LOST" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {item.type === "LOST" ? "🔍 مفقود" : "📦 موجود"}
                </span>
                <span className="text-sm text-gray-400">
                    {CATEGORY_LABELS[item.category]}
                </span>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* الصورة */}
                <div className="aspect-square overflow-hidden rounded-xl border bg-gray-50">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title}
                            className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-6xl">
                            {item.type === "LOST" ? "🔍" : "📦"}
                        </div>
                    )}
                </div>

                {/* التفاصيل */}
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-bold">{item.title}</h1>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>

                    <div className="flex flex-col gap-2 rounded-xl border p-4 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">الفئة</span>
                            <span className="font-medium">{CATEGORY_LABELS[item.category]}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">الموقع</span>
                            <span className="font-medium">📍 {item.location}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">التاريخ</span>
                            <span className="font-medium">{formatDate(item.date)}</span>
                        </div>
                    </div>

                    {/* معلومات الناشر مع Trust Score */}
                    <div className="flex items-center gap-3 rounded-xl border p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold">
                            {item.user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">{item.user.name}</p>
                            <p className="text-xs text-gray-400">
                                ⭐ Trust Score: {item.user.trustScore}
                            </p>
                        </div>
                    </div>

                    {/* زر المطالبة — يتغير حسب حالة المستخدم */}
                    {isOwner ? (
                        <Link
                            href="/dashboard"
                            className="block w-full rounded-xl border-2 border-black py-3 text-center text-sm font-semibold hover:bg-gray-50"
                        >
                            إدارة هذا البلاغ ← Dashboard
                        </Link>
                    ) : (
                        <ClaimButton
                            itemId={item.id}
                            itemType={item.type}
                            isLoggedIn={isLoggedIn}
                            secretQuestion={item.secretQuestion ?? null}
                        />
                    )}
                </div>
            </div>
        </div >
    );
}