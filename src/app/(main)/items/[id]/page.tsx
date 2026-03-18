import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById, getItemWithClaims } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import ClaimButton from "@/components/items/ClaimButton";
import ClaimsSection from "@/components/items/ClaimsSection";
import Link from "next/link";

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
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header / Breadcrumb */}
        <div className="mb-10 flex items-center gap-4">
          <span
            className={`font-outfit text-[10px] font-medium tracking-[2px] uppercase px-4 py-1.5 rounded-full border ${
              item.type === "LOST"
                ? "bg-red-500/10 text-red-400 border-red-500/20"
                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            }`}
          >
            {item.type === "LOST" ? "Lost" : "Found"}
          </span>
          <span className="font-outfit text-[11px] text-slate tracking-wider uppercase opacity-60">
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-xl bg-void border-2 border-gold/18 shadow-2xl relative z-10">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl text-gold/20 bg-gradient-to-br from-void to-obsidian">
                  {item.type === "LOST" ? (
                    <i className="fa-solid fa-magnifying-glass" />
                  ) : (
                    <i className="fa-solid fa-box" />
                  )}
                </div>
              )}
            </div>
            {/* Decorative background element */}
            <div className="absolute -inset-2 bg-gradient-to-r from-gold/20 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-1" />
          </div>

          {/* Content Section */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="font-cormorant text-5xl font-light text-ivory leading-[1.1]">
                {item.title}
              </h1>
              <p className="font-outfit text-[15px] font-light text-slate leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Property Grid */}
            <div className="bg-void border border-gold/15 rounded-xl overflow-hidden shadow-xl">
              {[
                { label: "Category", value: CATEGORY_LABELS[item.category], icon: "fa-tag" },
                {
                  label: "Location",
                  icon: "fa-location-dot",
                  value: item.location,
                },
                { label: "Date", icon: "fa-calendar", value: formatDate(item.date) },
              ].map((row: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-6 py-4 border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${row.icon} text-[10px] text-gold/50`} />
                    <span className="font-outfit text-[11px] uppercase tracking-widest text-slate">
                      {row.label}
                    </span>
                  </div>
                  <span className="font-outfit text-sm font-medium text-ivory">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Publisher Profile */}
            <div className="flex items-center gap-4 bg-void border border-gold/15 rounded-xl px-6 py-5 shadow-lg group hover:border-gold/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold font-bold flex-shrink-0 transition-transform group-hover:scale-110">
                {item.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-outfit text-sm font-medium text-ivory tracking-tight transition-colors group-hover:text-gold">
                  {item.user.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-0.5 text-gold text-[10px]">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fa-solid fa-star" />
                    ))}
                  </div>
                  <p className="font-outfit text-[10px] text-slate uppercase tracking-widest font-medium">
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
                  className="flex items-center justify-center gap-3 w-full font-outfit text-[11px] font-bold tracking-[3px] uppercase py-4 rounded-full border border-gold/30 text-gold bg-gold/5 hover:bg-gold hover:text-void transition-all duration-300 shadow-lg shadow-gold/5"
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
            <div className="mb-8 flex items-center justify-between border-b border-gold/10 pb-4">
              <h2 className="font-cormorant text-3xl font-light text-ivory">
                Recovery Requests
              </h2>
              <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-[12px] font-outfit uppercase tracking-widest">
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
