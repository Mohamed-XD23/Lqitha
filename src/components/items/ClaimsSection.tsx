"use client";

import { useState, useTransition } from "react";
import { respondToClaim } from "@/actions/item.actions";

// نعرّف نوع المطالبة بناءً على ما يُرجعه getItemWithClaims()
interface Claimant {
    id: string;
    name: string | null;
    image: string | null;
    trustScore: number;
}

interface Claim {
    id: string;
    status: string;
    createdAt: Date;
    claimant: Claimant;
}

interface Props {
    claims: Claim[];
    itemId: string;
}

export default function ClaimsSection({ claims, itemId }: Props) {
    const [isPending, startTransition] = useTransition();
    const [loadingId, setLoadingId] = useState<string | null>(null);

    // نفصل بين المعلق والمحسوم لعرضهم بشكل منظم
    const pendingClaims = claims.filter(c => c.status === "PENDING");
    const resolvedClaims = claims.filter(c => c.status !== "PENDING");

    function handleRespond(claimId: string, response: "ACCEPTED" | "REJECTED") {
        setLoadingId(claimId);
        startTransition(async () => {
            await respondToClaim(claimId, itemId, response);
            setLoadingId(null);
        });
    }

    if (claims.length === 0) {
        return (
            <div className="mt-10 rounded-xl border border-dashed p-8 text-center text-sm text-gray-400">
                
            </div>
        );
    }

    return (
        <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold">
                المطالبات الواردة
                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-sm text-indigo-600">
                    {pendingClaims.length} معلقة
                </span>
            </h2>

            <div className="flex flex-col gap-3">
                {claims.map((claim) => (
                    <div
                        key={claim.id}
                        className="flex items-center justify-between rounded-xl border p-4"
                    >
                        {/* معلومات المطالب */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                                {claim.claimant.name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                            <div>
                                <p className="font-medium">{claim.claimant.name}</p>
                                <p className="text-xs text-gray-400">
                                    ⭐ {claim.claimant.trustScore} · أجاب الإجابة الصحيحة ✅
                                </p>
                            </div>
                        </div>

                        {/* الأزرار أو الحالة */}
                        {claim.status === "PENDING" ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleRespond(claim.id, "ACCEPTED")}
                                    disabled={isPending}
                                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {loadingId === claim.id ? "..." : "قبول ✓"}
                                </button>
                                <button
                                    onClick={() => handleRespond(claim.id, "REJECTED")}
                                    disabled={isPending}
                                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                >
                                    {loadingId === claim.id ? "..." : "رفض ✕"}
                                </button>
                            </div>
                        ) : (
                            // عرض الحالة النهائية بدلاً من الأزرار
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                claim.status === "ACCEPTED"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                            }`}>
                                {claim.status === "ACCEPTED" ? "مقبول ✓" : "مرفوض ✕"}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}