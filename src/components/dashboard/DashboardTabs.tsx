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
      className: "bg-[#0A84FF]/10 text-[#0A84FF] border-[#0A84FF]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-circle text-[6px] opacity-70"></i>
          Active
        </span>
      ),
    },
    RESOLVED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-check"></i>
          Resolved
        </span>
      ),
    },
    ACCEPTED: {
      className: "bg-[#30D158]/10 text-[#30D158] border-[#30D158]/40",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-circle-check"></i>
          Accepted
        </span>
      ),
    },
    REJECTED: {
      className: "bg-[#FF453A]/10 text-[#FF453A] border-[#FF453A]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-xmark"></i>
          {rejectedBy === "owner" ? "Rejected by Owner" : "Rejected"}
        </span>
      ),
    },
    PENDING: {
      className: "bg-[#7A7A8C]/10 text-[#7A7A8C] border-[#7A7A8C]/20",
      label: (
        <span className="flex items-center gap-1.5">
          <i className="fa-solid fa-hourglass-half text-[9px]"></i>
          Pending
        </span>
      ),
    },
  };
  const s = map[status] || map.PENDING;
  return (
    <span className={`font-outfit text-[9px] font-medium tracking-[2px] uppercase px-3 py-1 rounded-[2px] border whitespace-nowrap ${s.className}`}>
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
      <p className="font-outfit text-xs text-[#7A7A8C] text-center py-16 opacity-50">
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
          className={`flex items-center gap-4 px-6 py-5 border-b border-[#C4A35A]/10 bg-transparent cursor-pointer w-full text-left transition-all hover:bg-[#C4A35A]/5 ${isPending ? "opacity-50 cursor-not-allowed" : "opacity-100"}`}
        >
          <div className="w-10 h-10 rounded-[2px] bg-[#C4A35A]/10 border border-[#C4A35A]/20 flex items-center justify-center flex-shrink-0 group">
            <i className="fa-solid fa-message text-[#C4A35A] text-sm" />
          </div>
          <div className="flex-1">
            <p className="font-outfit text-sm font-medium text-[#F2EFE8]">
              {claim.item.title}
            </p>
            <p className="font-outfit text-[10px] text-[#7A7A8C] tracking-wider uppercase mt-1">
              Connected · {formatDate(claim.createdAt)}
            </p>
          </div>
          <span className="font-outfit bg-[#C4A35A] text-[#080810] text-[10px] font-semibold tracking-[2px] uppercase px-4 py-2 rounded-[2px] flex items-center justify-center gap-2 min-w-[80px] hover:bg-[#F2EFE8] transition-colors">
            {isPending ? (
              <div className="scale-[0.8] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>
                Open Chat
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
    <div className="bg-[#13131F] border border-[#C4A35A]/18 rounded-[4px] overflow-hidden shadow-2xl">
      {/* Tab Headers */}
      <div className="bg-[#080810]/50 flex border-b border-[#C4A35A]/15 px-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center justify-center gap-3 px-6 py-5 font-outfit text-[10px] font-medium tracking-[3px] uppercase cursor-pointer bg-transparent border-none border-b-2 transition-all duration-300 relative ${
              activeTab === tab.key
                ? "border-[#C4A35A] text-[#F2EFE8]"
                : "border-transparent text-[#7A7A8C] hover:text-[#C4A35A]/70"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-[1px] text-[9px] font-bold ${activeTab === tab.key ? "bg-[#C4A35A] text-[#080810]" : "bg-[#C4A35A]/10 text-[#C4A35A] border border-[#C4A35A]/20"}`}>
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
                 <i className="fa-solid fa-box-open text-3xl text-[#C4A35A]/20 mb-4" />
                 <p className="font-outfit text-xs text-[#7A7A8C]">No listings published yet</p>
              </div>
            ) : (
              listings.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-6 py-5 border-b border-[#C4A35A]/10 last:border-0 hover:bg-[#C4A35A]/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.status === "ACTIVE" ? "bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"}`} />
                    <div className="flex flex-col gap-1.5">
                      <p className="font-outfit text-sm font-medium text-[#F2EFE8]">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap font-outfit text-[10px] text-[#7A7A8C] tracking-widest uppercase">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className="w-1 h-1 rounded-full bg-[#7A7A8C]/30" />
                        <div className="flex items-center gap-1.5">
                          <i className={`fa-solid ${item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"} text-[9px] text-[#C4A35A]/60`} />{" "}
                          {item.type === "LOST" ? "Lost" : "Found"}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-[#7A7A8C]/30" />
                        <span className="text-[#C4A35A]/80">{item._count.claims} Claims</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={item.status} />
                    <Link
                      href={`/items/${item.id}`}
                      className="font-outfit bg-transparent border border-[#C4A35A]/20 text-[10px] tracking-[2px] uppercase text-[#F2EFE8] px-4 py-2 rounded-[2px] flex items-center gap-2 hover:bg-[#C4A35A]/10 hover:border-[#C4A35A]/40 transition-all"
                    >
                      Manage
                      <i className="fa-solid fa-arrow-right text-[9px]"></i>
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
                  <i className="fa-solid fa-file-invoice text-3xl text-[#C4A35A]/20 mb-4" />
                  <p className="font-outfit text-xs text-[#7A7A8C]">No claims submitted yet</p>
               </div>
            ) : (
              claims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between px-6 py-5 border-b border-[#C4A35A]/10 last:border-0 hover:bg-[#C4A35A]/5 transition-colors"
                >
                  <div className="flex flex-col gap-1.5">
                    <p className="font-outfit text-sm font-medium text-[#F2EFE8]">
                      {claim.item.title}
                    </p>
                    <div className="flex items-center gap-3 flex-wrap font-outfit text-[10px] text-[#7A7A8C] tracking-widest uppercase">
                      <span>{formatDate(claim.createdAt)}</span>
                      <span className="w-1 h-1 rounded-full bg-[#7A7A8C]/30" />
                      <div className="flex items-center gap-1.5">
                        <i className={`fa-solid ${claim.item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"} text-[9px] text-[#C4A35A]/60`} />{" "}
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
                        className="font-outfit bg-transparent border border-[#C4A35A]/20 text-[10px] tracking-[2px] uppercase text-[#F2EFE8] px-4 py-2 rounded-[2px] flex items-center gap-2 hover:bg-[#C4A35A]/10 transition-all"
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
