"use client";

import { useState, useTransition } from "react";
import type { Dictionary } from "@/lib/dictionary.types";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import ChatButton from "@/components/chat/ChatButton";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { useChatContext } from "@/context/ChatContext";
import {
  Circle,
  Check,
  CheckCircle2,
  X,
  Hourglass,
  MessageSquare,
  PackageOpen,
  ArrowRight,
  FileText,
  Search,
  Package,
} from "lucide-react";

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
  dict: Dictionary;
}

function StatusBadge({
  status,
  rejectedBy,
  dict,
}: {
  status: string;
  rejectedBy?: string | null;
  dict: Dictionary;
}) {
  const t = dict.dashboardTabs.status;
  const map: Record<string, { className: string; label: React.ReactNode }> = {
    ACTIVE: {
      className: "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Circle
            className="w-1.5 h-1.5 opacity-70 fill-current"
            strokeWidth={2.5}
          />
          {t.active}
        </span>
      ),
    },
    RESOLVED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Check className="w-3 h-3" strokeWidth={3} />
          {t.resolved}
        </span>
      ),
    },
    ACCEPTED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/40",
      label: (
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
          {t.accepted}
        </span>
      ),
    },
    REJECTED: {
      className: "bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <X className="w-3 h-3" strokeWidth={3} />
          {rejectedBy === "owner" ? t.rejectedByOwner : t.rejected}
        </span>
      ),
    },
    PENDING: {
      className:
        "bg-muted-foreground/10 text-muted-foreground border-muted-foreground/20",
      label: (
        <span className="flex items-center gap-1.5">
          <Hourglass className="w-2.5 h-2.5" strokeWidth={2.5} />
          {t.pending}
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
  dict,
}: {
  claims: Claim[];
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
  dict: Dictionary;
}) {
  const t = dict.dashboardTabs;
  const { openChat } = useChatContext();
  const [isPending, startTransition] = useTransition();
  const acceptedClaims = claims.filter((c) => c.status === "ACCEPTED");

  if (acceptedClaims.length === 0) {
    return (
      <p className="font-interface text-xs text-muted-foreground text-center py-16 opacity-50">
        {t.messages.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col min-h-75 max-h-125 overflow-y-auto">
      {acceptedClaims.map((claim) => (
        <div
          key={claim.id}
          className={`flex items-center gap-4 px-6 py-5 border-b border-border bg-transparent cursor-pointer w-full text-left transition-all hover:bg-primary/5 ${isPending ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        >
          <div className="w-10 h-10 rounded-xs bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group">
            <MessageSquare
              className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors"
              strokeWidth={2}
            />
          </div>
          <div className="flex-1">
            <p className="font-interface text-sm font-medium text-foreground">
              {claim.item.title}
            </p>
            <p className="font-interface text-xs text-muted-foreground tracking-wider uppercase mt-1">
              {t.messages.status} · {formatDate(claim.createdAt)}
            </p>
          </div>
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
            className="font-interface bg-primary text-background text-xs font-semibold tracking-xs uppercase px-4 py-2 rounded-xs flex items-center justify-center gap-2 min-w-20 hover:bg-foreground transition-colors"
          >
            {isPending ? (
              <div className="scale-[0.8] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>{t.actions.openChat}</>
            )}
          </button>
        </div>
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
  dict,
}: Props) {
  const t = dict.dashboardTabs;
  const [activeTab, setActiveTab] = useState<
    "listings" | "claims" | "messages"
  >("listings");

  const tabs = [
    { key: "listings" as const, label: t.myListings, count: listings.length },
    { key: "claims" as const, label: t.myClaims, count: claims.length },
    {
      key: "messages" as const,
      label: t.messages.title,
      count: claims.filter((c) => c.status === "ACCEPTED").length,
    },
  ];

  return (
    <div className="bg-card border border-primary/18 rounded-sm overflow-hidden shadow-2xl">
      {/* Tab Headers */}
      <div className="bg-background/50 flex border-b border-primary/15 px-2 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-2 px-4 py-3 font-interface text-[10px] sm:text-xs font-light sm:font-medium sm:tracking-[3px] uppercase cursor-pointer bg-transparent border-none border-b-2 transition-all duration-300 relative ${
              activeTab === tab.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-primary/70"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`flex items-center justify-center px-2 py-1 rounded-sm text-xs font-bold ${activeTab === tab.key ? "bg-primary text-background" : "bg-primary/10 text-primary border border-primary/20"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="min-h-75 max-h-125 overflow-y-auto">
        {/* My Listings */}
        {activeTab === "listings" && (
          <div className="flex flex-col">
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-50">
                <PackageOpen
                  className="w-8 h-8 text-primary/20 mb-4"
                  strokeWidth={1.5}
                />
                <p className="font-interface text-xs text-muted-foreground">
                  {t.empty.noItems}
                </p>
              </div>
            ) : (
              listings.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 sm:gap-0 sm:flex-row items-center justify-between px-6 py-5 border-b border-border last:border-0 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.status === "ACTIVE" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"}`}
                    />
                    <div className="flex flex-col gap-1.5">
                      <p className="font-interface text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap font-interface text-xs text-muted-foreground tracking-widest uppercase">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <div className="flex items-center gap-1.5">
                          {item.type === "LOST" ? (
                            <Search
                              className="w-2.5 h-2.5 text-muted-foreground/60"
                              strokeWidth={2.5}
                            />
                          ) : (
                            <Package
                              className="w-2.5 h-2.5 text-muted-foreground/60"
                              strokeWidth={2.5}
                            />
                          )}
                          {item.type === "LOST" ? t.types.LOST : t.types.FOUND}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-primary/80">
                          {item._count.claims} {t.claims}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={item.status} dict={dict} />
                    <Link
                      href={`/items/${item.id}`}
                      className="font-interface bg-transparent border border-primary/20 text-xs tracking-xs uppercase text-foreground px-4 py-2 rounded-xs flex items-center gap-2 hover:bg-primary/10 hover:border-primary/40 transition-all"
                    >
                      {t.actions.manage}
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
                <FileText
                  className="w-8 h-8 text-primary/20 mb-4"
                  strokeWidth={1.5}
                />
                <p className="font-interface text-xs text-muted-foreground">
                  {t.empty.noClaims}
                </p>
              </div>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-col gap-4 sm:gap-0 sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-border last:border-0 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="font-interface text-sm font-medium text-foreground">
                      {claim.item.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap font-interface text-xs text-muted-foreground tracking-widest uppercase">
                      <span>{formatDate(claim.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <div className="flex items-center gap-1.5">
                        {claim.item.type === "LOST" ? (
                          <Search
                            className="w-2.5 h-2.5 text-muted-foreground/60"
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Package
                            className="w-2.5 h-2.5 text-muted-foreground/60"
                            strokeWidth={2.5}
                          />
                        )}
                        {claim.item.type === "LOST" ? "Lost" : "Found"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge
                      status={claim.status}
                      rejectedBy={claim.rejectedBy}
                      dict={dict}
                    />
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/items/${claim.item.id}`}
                        className="font-interface bg-transparent border border-primary/20 text-xs tracking-xs uppercase text-foreground px-4 py-2 rounded-xs flex items-center gap-2 hover:bg-primary/10 transition-all"
                      >
                        {t.actions.view}
                      </Link>
                      {claim.status === "ACCEPTED" && (
                        <ChatButton
                          claimId={claim.id}
                          ownerId={claim.item.userId}
                          claimantId={currentUserId}
                          currentUserId={currentUserId}
                          currentUserName={currentUserName}
                          currentUserImage={currentUserImage}
                          dict={dict}
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
              dict={dict}
            />
          </div>
        )}
      </div>
    </div>
  );
}
