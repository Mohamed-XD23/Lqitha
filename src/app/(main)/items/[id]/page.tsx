import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById, getItemWithClaims } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import ClaimButton from "@/components/items/ClaimButton";
import ClaimsSection from "@/components/items/ClaimsSection";
import Link from "next/link";
import Image from "next/image";

interface ItemPageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  PHONE: "Phone",
  KEYS: "Keys",
  WALLET: "Wallet",
  DOCUMENTS: "Documents",
  ELECTRONICS: "Electronics",
  OTHER: "Other",
};

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([getItemById(id), auth()]);
  if (!item) return notFound();

  const isOwner = session?.user?.id === item.user.id;
  const isLoggedIn = !!session?.user;
  const itemWithClaims = isOwner ? await getItemWithClaims(id) : null;

  return (
    <div className="bg-[#080810] min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header / Breadcrumb */}
        <div className="mb-10 flex items-center gap-4">
          <span
            className={`font-outfit text-[9px] font-bold tracking-[2px] uppercase px-4 py-1.5 rounded-full border ${
              item.type === "LOST"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {item.type === "LOST" ? "Lost" : "Found"}
          </span>
          <span className="font-outfit text-[11px] text-[#7A7A8C] tracking-[3px] uppercase font-bold opacity-70">
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-xl bg-[#13131F] border border-[#C4A35A]/15 shadow-2xl relative z-10">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl text-[#C4A35A]/10 bg-gradient-to-br from-[#13131F] to-[#080810]">
                  {item.type === "LOST" ? (
                    <i className="fa-solid fa-magnifying-glass" />
                  ) : (
                    <i className="fa-solid fa-box" />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="font-cormorant text-5xl font-light text-[#F2EFE8] leading-[1.1]">
                {item.title}
              </h1>
              <p className="font-outfit text-[15px] font-light text-[#7A7A8C] leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Property Grid */}
            <div className="bg-[#13131F] border border-[#C4A35A]/15 rounded-xl overflow-hidden shadow-xl">
              {[
                {
                  label: "Category",
                  value: CATEGORY_LABELS[item.category],
                  icon: "fa-tag",
                },
                {
                  label: "Location",
                  icon: "fa-location-dot",
                  value: item.location,
                },
                {
                  label: "Date",
                  icon: "fa-calendar",
                  value: formatDate(item.date),
                },
              ].map((row: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 border-b border-[#C4A35A]/10 last:border-0 hover:bg-[#C4A35A]/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <i
                      className={`fa-solid ${row.icon} text-[10px] text-[#C4A35A]/50`}
                    />
                    <span className="font-outfit text-[10px] uppercase tracking-[2px] text-[#7A7A8C] font-bold">
                      {row.label}
                    </span>
                  </div>
                  <span className="font-outfit text-sm font-medium text-[#F2EFE8]">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Publisher Profile */}
            <div className="flex items-center gap-4 bg-[#13131F] border border-[#C4A35A]/15 rounded-xl px-6 py-5 shadow-lg group hover:border-[#C4A35A]/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A35A]/10 border border-[#C4A35A]/30 text-[#C4A35A] font-bold shrink-0 transition-transform group-hover:scale-110">
                {item.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-outfit text-sm font-medium text-[#F2EFE8] tracking-tight transition-colors group-hover:text-[#C4A35A]">
                  {item.user.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  
                  <p className="font-outfit text-[10px] text-[#7A7A8C] uppercase tracking-[2px] font-bold">
                    Trust Score: {item.user.trustScore}
                  </p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Action Section */}
            <div className="mt-4">
              {isOwner ? (
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-3 w-full font-outfit text-[11px] font-bold tracking-[3px] uppercase py-4 rounded-full border border-[#C4A35A]/30 text-[#C4A35A] bg-[#C4A35A]/5 hover:bg-[#C4A35A] hover:text-[#080810] transition-all duration-300 shadow-lg shadow-[#C4A35A]/5"
                >
                  Manage this Report
                  <i className="fa-solid fa-arrow-left text-[10px]" />
                </Link>
              ) : item.status === "RESOLVED" ? (
                <div className="flex items-center justify-center gap-3 w-full py-4 font-outfit text-[12px] font-medium tracking-wide text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                  <i className="fa-solid fa-circle-check" />
                  This report has been successfully resolved
                </div>
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
        </div>

        {/* Admin/Claims Section */}
        {isOwner && itemWithClaims && session?.user && (
          <div className="mt-20">
            <div className="mb-8 flex items-center justify-between border-b border-[#C4A35A]/10 pb-4">
              <h2 className="font-cormorant text-3xl font-light text-[#F2EFE8]">
                Recovery Requests
              </h2>
              <span className="bg-[#C4A35A]/10 text-[#C4A35A] border border-[#C4A35A]/20 px-3 py-1 rounded-full text-[12px] font-outfit font-bold uppercase tracking-[2px]">
                {itemWithClaims.claims.length} Requests
              </span>
            </div>
            <ClaimsSection
              claims={itemWithClaims.claims}
              itemId={id}
              ownerId={item.user.id}
              currentUserId={session.user.id!}
              currentUserName={session.user.name ?? "User"}
              currentUserImage={session.user.image}
            />
          </div>
        )}
      </div>
    </div>
  );
}
