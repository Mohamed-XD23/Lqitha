import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getItemById, getItemWithClaims, getUserClaimStatus } from "@/actions/item.actions";
import { getDictionary } from "@/lib/dictionary";
import { formatDate } from "@/lib/utils/date";
import ClaimButton from "@/components/items/ClaimButton";
import ClaimsSection from "@/components/items/ClaimsSection";
import Link from "next/link";
import Image from "next/image";
import { Search, Package, Tag, MapPin, Calendar, ArrowLeft, CheckCircle } from "lucide-react";

interface ItemPageProps { params: Promise<{ id: string }>; }

export default async function ItemPage({ params }: ItemPageProps) {
  const { id } = await params;
  const [item, session, dict] = await Promise.all([getItemById(id), auth(), getDictionary()]);
  if (!item) return notFound();

  const t = dict.item;
  const isOwner = session?.user?.id === item.user.id;
  const isLoggedIn = !!session?.user;

  const [itemWithClaims, claimStatus] = await Promise.all([
    isOwner ? getItemWithClaims(id) : Promise.resolve(null),
    isLoggedIn && !isOwner ? getUserClaimStatus(id) : Promise.resolve(null),
  ]);

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">

        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <span className={`font-interface text-[9px] font-bold tracking-xs uppercase px-4 py-1.5 rounded-full border ${
            item.type === "LOST"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          }`}>
            {item.type === "LOST" ? t.lost : t.found}
          </span>
          <span className="font-interface text-[11px] text-slate tracking-[3px] uppercase font-bold opacity-70">
            {t.categories[item.category as keyof typeof t.categories] ?? item.category}
          </span>
        </div>

        <div className="grid gap-12 md:grid-cols-2">

          {/* Image */}
          <div className="relative group">
            <div className="aspect-square overflow-hidden rounded-xl bg-void border border-gold/15 shadow-2xl relative z-10">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.title} fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-gold/10 bg-linear-to-br from-void to-obsidian">
                  {item.type === "LOST"
                    ? <Search className="w-16 h-16" />
                    : <Package className="w-16 h-16" />
                  }
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-8">
            <div className="space-y-4">
              <h1 className="font-display text-5xl font-light text-ivory leading-[1.1]">{item.title}</h1>
              <p className="font-interface text-[15px] font-light text-slate leading-relaxed">{item.description}</p>
            </div>

            {/* Info Grid */}
            <div className="bg-void border border-gold/15 rounded-xl overflow-hidden shadow-xl">
              {[
                { label: t.category, value: t.categories[item.category as keyof typeof t.categories] ?? item.category, icon: Tag },
                { label: t.location, value: item.location, icon: MapPin },
                { label: t.date, value: formatDate(item.date), icon: Calendar },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <row.icon className="w-3.5 h-3.5 text-gold/50" strokeWidth={2} />
                    <span className="font-interface text-xs uppercase tracking-xs text-slate font-bold">{row.label}</span>
                  </div>
                  <span className="font-interface text-sm font-medium text-ivory">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Publisher */}
            <div className="flex items-center gap-4 bg-void border border-gold/15 rounded-xl px-6 py-5 shadow-lg group hover:border-gold/30 transition-all">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold font-bold shrink-0 transition-transform group-hover:scale-110">
                {item.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-interface text-sm font-medium text-ivory tracking-tight transition-colors group-hover:text-gold">
                  {item.user.name}
                </p>
                <p className="font-interface text-xs text-slate uppercase tracking-xs font-bold mt-1">
                  {t.trustScore}: {item.user.trustScore}
                </p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            </div>

            {/* Action */}
            <div className="mt-4">
              {isOwner ? (
                <Link href="/dashboard" className="flex items-center justify-center gap-3 w-full font-interface text-[11px] font-bold tracking-[3px] uppercase py-4 rounded-full border border-gold/30 text-gold bg-gold/5 hover:bg-gold hover:text-obsidian transition-all duration-300">
                  {t.manageReport}
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2.5} />
                </Link>
              ) : item.status === "RESOLVED" ? (
                <div className="flex items-center justify-center gap-3 w-full py-4 font-interface text-[12px] font-medium tracking-wide text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                  <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  {t.resolvedMessage}
                </div>
              ) : (
                <ClaimButton
                  itemId={item.id}
                  itemType={item.type}
                  isLoggedIn={isLoggedIn}
                  secretQuestion={item.secretQuestion ?? null}
                  claimStatus={claimStatus}
                  dict={dict}
                />
              )}
            </div>
          </div>
        </div>

        {/* Claims Section */}
        {isOwner && itemWithClaims && session?.user && (
          <div className="mt-20">
            <div className="mb-8 flex items-center justify-between border-b border-gold/10 pb-4">
              <h2 className="font-display text-3xl font-light text-ivory">{t.recoveryRequests}</h2>
              <span className="bg-gold/10 text-gold border border-gold/20 px-3 py-1 rounded-full text-[12px] font-interface font-bold uppercase tracking-xs">
                {itemWithClaims.claims.length} {t.requests}
              </span>
            </div>
            <ClaimsSection
              claims={itemWithClaims.claims}
              itemId={id}
              ownerId={item.user.id}
              currentUserId={session.user.id!}
              currentUserName={session.user.name ?? t.new.user}
              currentUserImage={session.user.image}
              dict={dict}
            />
          </div>
        )}
      </div>
    </div>
  );
}