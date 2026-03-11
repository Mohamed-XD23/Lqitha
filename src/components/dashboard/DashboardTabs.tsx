"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

// ── Types ──
interface Listing {
  id: string;
  title: string;
  type: "LOST" | "FOUND";
  status: "ACTIVE" | "RESOLVED";
  createdAt: Date;
  _count: { claims: number };
}

interface Claim {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  rejectedBy: string | null;
  createdAt: Date;
  item: { id: string; title: string; type: "LOST" | "FOUND" };
}

interface Props {
  listings: Listing[];
  claims: Claim[];
}

// ── Status Badge ──
function StatusBadge({ status, rejectedBy }: { status: string; rejectedBy?: string | null }) {
  const styles: Record<string, string> = {
    ACTIVE:   "bg-blue-50 text-blue-600 border-blue-200",
    RESOLVED: "bg-green-50 text-green-600 border-green-200",
    ACCEPTED: "bg-green-50 text-green-600 border-green-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200",
    PENDING:  "bg-amber-50 text-amber-600 border-amber-200",
  };
  const labels: Record<string, string> = {
    ACTIVE:   "نشط",
    RESOLVED: "محلول",
    ACCEPTED: "مقبول ✓",
    REJECTED: rejectedBy === "owner" ? "مرفوض من المالك" : "مرفوض",
    PENDING:  "قيد الانتظار",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// ── Main Component ──
export default function DashboardTabs({ listings, claims }: Props) {
  const [activeTab, setActiveTab] = useState<"listings" | "claims" | "messages">("listings");

  const tabs = [
    { key: "listings", label: "My Listings", count: listings.length },
    { key: "claims",   label: "My Claims",   count: claims.length },
    { key: "messages", label: "Messages",    count: 0 },
  ] as const;

  return (
    <div className="rounded-2xl border bg-white shadow-sm">
      {/* Tab Headers */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">

        {/* My Listings */}
        {activeTab === "listings" && (
          <div className="flex flex-col gap-3">
            {listings.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                لم تنشر أي بلاغ بعد
              </p>
            ) : (
              listings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border px-5 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      item.status === "ACTIVE" ? "bg-blue-500" : "bg-green-500"
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(item.createdAt)} ·{" "}
                        {item.type === "LOST" ? "🔍 مفقود" : "📦 موجود"} ·{" "}
                        {item._count.claims} مطالبة
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <Link
                      href={`/items/${item.id}`}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Claims */}
        {activeTab === "claims" && (
          <div className="flex flex-col gap-3">
            {claims.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                لم تقم بأي مطالبة بعد
              </p>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-xl border px-5 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{claim.item.title}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(claim.createdAt)} ·{" "}
                      {claim.item.type === "LOST" ? "🔍 مفقود" : "📦 موجود"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={claim.status} rejectedBy={claim.rejectedBy} />
                    <Link
                      href={`/items/${claim.item.id}`}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages — Phase 5 Chat */}
        {activeTab === "messages" && (
          <p className="py-8 text-center text-sm text-gray-400">
            ✉️ نظام الرسائل قيد البناء...
          </p>
        )}

      </div>
    </div>
  );
}