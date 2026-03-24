"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import ChatButton from "@/components/chat/ChatButton";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { useChatContext } from "@/context/ChatContext";
import { Circle, Check, CheckCircle2, X, Hourglass, MessageSquare, PackageOpen, ArrowRight, FileText, Search, Package } from "lucide-react";

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
  item: { id: string; title: string; type: "LOST" | "FOUND"; userId: string };
}
interface Props {
  listings: Listing[];
  claims: Claim[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
}

function StatusBadge({
  status,
  rejectedBy,
}: {
  status: string;
  rejectedBy?: string | null;
}) {
  const map: Record<string, { className: string; label: React.ReactNode }> = {
    ACTIVE: {
      className: "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Circle className="w-1.5 h-1.5 opacity-70 fill-current" strokeWidth={2.5} />
          Active
        </span>
      ),
    },
    RESOLVED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={3} />
          Resolved
        </span>
      ),
    },
    ACCEPTED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/40",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
          Accepted
        </span>
      ),
    },
    REJECTED: {
      className: "bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <X className="w-3 h-3" strokeWidth={3} />
          {rejectedBy === "owner" ? "Rejected by Owner" : "Rejected"}
        </span>
      ),
    },
    PENDING: {
      className: "bg-slate/10 text-slate border-slate/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Hourglass className="w-2.5 h-2.5" strokeWidth={2.5} />
          Pending
        </span>
      ),
    },
  };
  const s = map[status] || map.PENDING;
  return (
    <span
      className={`font-interface text-[9px] font-medium tracking-xs uppercase px-3 py-1 rounded-xs border whitespace-nowrap ${s.className}`}
    >
      {s.label}
    </span>
  );
}

function MessagesTab({
  claims,
  currentUserId,
  currentUserName,
  currentUserImage,
}: {
  claims: Claim[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
}) {
  const { openChat } = useChatContext();
  const [isPending, startTransition] = useTransition();
  const acceptedClaims = claims.filter((c) => c.status === "ACCEPTED");

  if (acceptedClaims.length === 0) {
    return (
      <p className="font-interface text-xs text-slate text-center py-16 opacity-50">
        No active messages
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {acceptedClaims.map((claim) => (
        <button
          key={claim.id}
          disabled={isPending}
          onClick={() => {
            startTransition(async () => {
              const { createChatChannel } =
                await import("@/actions/chat.actions");
              const result = await createChatChannel(
                claim.id,
                claim.item.userId,
                currentUserId,
              );
              if (result.channelId)
                openChat({
                  channelId: result.channelId,
                  userId: currentUserId,
                  userName: currentUserName,
                  userImage: currentUserImage,
                });
            });
          }}
          className={`flex items-center gap-4 px-6 py-5 border-b border-gold/10 bg-transparent cursor-pointer w-full text-left transition-all hover:bg-gold/5 ${isPending ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        >
          <div className="w-10 h-10 rounded-xs bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0 group">
            <MessageSquare className="w-4 h-4 text-slate group-hover:text-gold transition-colors" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <p className="font-interface text-sm font-medium text-ivory">
              {claim.item.title}
            </p>
            <p className="font-interface text-[10px] text-slate tracking-wider uppercase mt-1">
              Connected · {formatDate(claim.createdAt)}
            </p>
          </div>
          <span className="font-interface bg-gold text-obsidian text-[10px] font-semibold tracking-xs uppercase px-4 py-2 rounded-xs flex items-center justify-center gap-2 min-w-[80px] hover:bg-ivory transition-colors">
            {isPending ? (
              <div className="scale-[0.8] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>Open Chat</>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

export default function DashboardTabs({
  listings,
  claims,
  currentUserId,
  currentUserName,
  currentUserImage,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "listings" | "claims" | "messages"
  >("listings");

  const tabs = [
    { key: "listings" as const, label: "My Listings", count: listings.length },
    { key: "claims" as const, label: "My Claims", count: claims.length },
    {
      key: "messages" as const,
      label: "Messages",
      count: claims.filter((c) => c.status === "ACCEPTED").length,
    },
  ];

  return (
    <div className="bg-void border border-gold/18 rounded-sm overflow-hidden shadow-2xl">
      {/* Tab Headers */}
      <div className="bg-obsidian/50 flex border-b border-gold/15 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-3 px-6 py-5 font-interface text-[10px] font-medium tracking-[3px] uppercase cursor-pointer bg-transparent border-none border-b-2 transition-all duration-300 relative ${
              activeTab === tab.key
                ? "border-gold text-ivory"
                : "border-transparent text-slate hover:text-gold/70"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-1.5 py-0.5 rounded-px text-[9px] font-bold ${activeTab === tab.key ? "bg-gold text-obsidian" : "bg-gold/10 text-gold border border-gold/20"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-[300px]">
        {/* My Listings */}
        {activeTab === "listings" && (
          <div className="flex flex-col">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-50">
                <PackageOpen className="w-8 h-8 text-gold/20 mb-4" strokeWidth={1.5} />
                <p className="font-interface text-xs text-slate">
                  No listings published yet
                </p>
              </div>
            ) : (
              listings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-5 border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "ACTIVE" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"}`}
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="font-interface text-sm font-medium text-ivory">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap font-interface text-[10px] text-slate tracking-widest uppercase">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate/30" />
                        <div className="flex items-center gap-1.5">
                          {item.type === "LOST" ? <Search className="w-2.5 h-2.5 text-slate/60" strokeWidth={2.5} /> : <Package className="w-2.5 h-2.5 text-slate/60" strokeWidth={2.5} />}
                          {item.type === "LOST" ? "Lost" : "Found"}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate/30" />
                        <span className="text-gold/80">
                          {item._count.claims} Claims
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={item.status} />
                    <Link
                      href={`/items/${item.id}`}
                      className="font-interface bg-transparent border border-gold/20 text-[10px] tracking-xs uppercase text-ivory px-4 py-2 rounded-xs flex items-center gap-2 hover:bg-gold/10 hover:border-gold/40 transition-all"
                    >
                      Manage
                      <ArrowRight className="w-2.5 h-2.5" strokeWidth={2.5} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Claims */}
        {activeTab === "claims" && (
          <div className="flex flex-col">
            {claims.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-50">
                <FileText className="w-8 h-8 text-gold/20 mb-4" strokeWidth={1.5} />
                <p className="font-interface text-xs text-slate">
                  No claims submitted yet
                </p>
              </div>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between px-6 py-5 border-b border-gold/10 last:border-0 hover:bg-gold/5 transition-colors"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="font-interface text-sm font-medium text-ivory">
                      {claim.item.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap font-interface text-[10px] text-slate tracking-widest uppercase">
                      <span>{formatDate(claim.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-slate/30" />
                      <div className="flex items-center gap-1.5">
                        {claim.item.type === "LOST" ? <Search className="w-2.5 h-2.5 text-slate/60" strokeWidth={2.5} /> : <Package className="w-2.5 h-2.5 text-slate/60" strokeWidth={2.5} />}
                        {claim.item.type === "LOST" ? "Lost" : "Found"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge
                      status={claim.status}
                      rejectedBy={claim.rejectedBy}
                    />
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/items/${claim.item.id}`}
                        className="font-interface bg-transparent border border-gold/20 text-[10px] tracking-xs uppercase text-ivory px-4 py-2 rounded-xs flex items-center gap-2 hover:bg-gold/10 transition-all"
                      >
                        View
                      </Link>
                      {claim.status === "ACCEPTED" && (
                        <ChatButton
                          claimId={claim.id}
                          ownerId={claim.item.userId}
                          claimantId={currentUserId}
                          currentUserId={currentUserId}
                          currentUserName={currentUserName}
                          currentUserImage={currentUserImage}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Messages */}
        {activeTab === "messages" && (
          <div>
            <MessagesTab
              claims={claims}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserImage={currentUserImage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
