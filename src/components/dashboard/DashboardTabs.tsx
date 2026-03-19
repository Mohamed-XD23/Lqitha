"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import ChatButton from "@/components/chat/ChatButton";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { useChatContext } from "@/context/ChatContext";

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
  const map: Record<
    string,
    { className: string; label: React.ReactNode }
  > = {
    ACTIVE: {
      className: "bg-blue-500/10 text-blue-400 border-blue-500/40",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-circle text-[6px] opacity-70"></i>
          Active
        </span>
      ),
    },

    RESOLVED: {
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-check"></i>
          Resolved
        </span>
      ),
    },

    ACCEPTED: {
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/60",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-thumbs-up"></i>
          Accepted
        </span>
      ),
    },

    REJECTED: {
      className: "bg-red-500/10 text-red-400 border-red-500/40",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-xmark"></i>
          {rejectedBy === "owner" ? "Rejected by owner" : "Rejected"}
        </span>
      ),
    },

    PENDING: {
      className: "bg-slate/10 text-slate border-slate/40",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-hourglass-half text-[10px]"></i>
          Pending Review
        </span>
      ),
    },
  };
  const s = map[status];
  return (
    <span className={`font-outfit text-[10px] font-medium tracking-wide px-3 py-1 rounded-full border whitespace-nowrap ${s.className}`}>
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
      <p className="font-outfit text-xs text-slate text-center py-10">
        No messages yet
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
          className={`flex items-center gap-3.5 px-6 py-4 border-b border-gold/10 bg-transparent cursor-pointer w-full text-right transition-opacity ${isPending ? "opacity-70 cursor-not-allowed" : "opacity-100"}`}
        >
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <i className="fa-solid fa-message text-gold text-sm" />
          </div>
          <div className="flex-1">
            <p className="font-outfit text-[15px] font-medium text-ivory">
              {claim.item.title}
            </p>
            <p className="font-outfit text-[11px] text-slate mt-0.5">
              {formatDate(claim.createdAt)}
            </p>
          </div>
          <span className="font-outfit bg-gold/10 border border-gold/20 text-[12px] tracking-widest uppercase text-gold px-2.5 py-1 rounded-lg flex items-center justify-center gap-1.5 min-w-[50px] min-h-[32px]">
            {isPending ? (
              <div className="scale-[1] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>
                View
                <i className="fa-solid fa-eye text-xs"></i>
              </>
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
    <div className="bg-void border border-gold/18 rounded-sm overflow-hidden">
      {/* Tab Headers */}
      <div className="bg-black flex border-b border-gold/15">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-2 flex-1 py-4.5 font-outfit text-[11px] font-medium tracking-[2px] uppercase cursor-pointer bg-transparent border-none border-b-2 transition-all duration-200 ${
              activeTab === tab.key
                ? "border-gold text-gold"
                : "border-gold/20 text-slate hover:text-gold/60"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded-full text-[12px]">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Listings */}
      {activeTab === "listings" && (
        <div className="flex flex-col">
          {listings.length === 0 ? (
            <p className="font-outfit text-xs text-slate text-center py-10"> No listings yet</p>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gold/10 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === "ACTIVE" ? "bg-blue-400" : "bg-emerald-400"}`} />
                  <div className="flex flex-col gap-1">
                    <p className="font-outfit text-[15px] font-medium text-ivory">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap font-outfit text-[11px] text-slate mt-0.5">
                      {formatDate(item.createdAt)} ·{" "}
                      <div className="flex items-center gap-1">
                        <i className={`fa-solid ${item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"} text-[10px]`} />{" "}
                        {item.type === "LOST" ? "Lost" : "Found"}
                      </div>
                      · {item._count.claims} claims
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={item.status} />
                  <Link
                    href={`/items/${item.id}`}
                    className="font-outfit bg-gold/10 border border-gold/20 text-[12px] tracking-widest uppercase text-gold px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-gold/20 transition-colors"
                  >
                    View
                    <i className="fa-solid fa-eye text-xs"></i>
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
            <p className="font-outfit text-xs text-slate text-center py-10">No claims yet</p>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                className="flex items-center justify-between px-6 py-4 border-b border-gold/10 last:border-0"
              >
                <div>
                  <p className="font-outfit text-[15px] font-medium text-ivory">
                    {claim.item.title}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap font-outfit text-[11px] text-slate mt-0.5">
                    {formatDate(claim.createdAt)} ·{" "}
                    <div className="flex items-center gap-1">
                      <i className={`fa-solid ${claim.item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"} text-[10px]`} />{" "}
                      {claim.item.type === "LOST" ? "Lost" : "Found"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={claim.status}
                    rejectedBy={claim.rejectedBy}
                  />
                  <Link
                    href={`/items/${claim.item.id}`}
                    className="font-outfit bg-gold/10 border border-gold/20 text-[12px] tracking-widest uppercase text-gold px-2.5 py-1 rounded-lg flex items-center gap-1.5 hover:bg-gold/20 transition-colors"
                  >
                    View
                    <i className="fa-solid fa-eye text-xs"></i>
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
            ))
          )}
        </div>
      )}

      {/* Messages */}
      {activeTab === "messages" && (
        <MessagesTab
          claims={claims}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          currentUserImage={currentUserImage}
        />
      )}
    </div>
  );
}
