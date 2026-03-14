"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";
import ChatButton from "@/components/chat/ChatButton";
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
    { bg: string; color: string; border: string; label: string }
  > = {
    ACTIVE: {
      bg: "rgba(100,150,255,0.08)",
      color: "#8AABF0",
      border: "rgba(100,150,255,0.2)",
      label: "نشط",
    },
    RESOLVED: {
      bg: "rgba(100,200,130,0.08)",
      color: "#7DC99A",
      border: "rgba(100,200,130,0.2)",
      label: "محلول",
    },
    ACCEPTED: {
      bg: "rgba(100,200,130,0.08)",
      color: "#7DC99A",
      border: "rgba(100,200,130,0.2)",
      label: "مقبول ✓",
    },
    REJECTED: {
      bg: "rgba(200,100,100,0.08)",
      color: "#D48080",
      border: "rgba(200,100,100,0.2)",
      label: rejectedBy === "owner" ? "مرفوض من المالك" : "مرفوض",
    },
    PENDING: {
      bg: "rgba(196,163,90,0.08)",
      color: "#C4A35A",
      border: "rgba(196,163,90,0.2)",
      label: "قيد الانتظار",
    },
  };
  const s = map[status];
  return (
    <span
      style={{
        fontFamily: "var(--font-outfit)",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "1px",
        padding: "4px 12px",
        borderRadius: "40px",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        whiteSpace: "nowrap",
      }}
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
      <p
        style={{
          fontFamily: "var(--font-outfit)",
          fontSize: "12px",
          color: "#7A7A8C",
          textAlign: "center",
          padding: "40px 0",
        }}
      >
        لا توجد محادثات بعد
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {acceptedClaims.map((claim) => (
        <button
          key={claim.id}
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
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "16px 24px",
            borderBottom: "1px solid rgba(196,163,90,0.08)",
            background: "transparent",
            border: "none",
            borderBottomWidth: "1px",
            borderBottomStyle: "solid",
            borderBottomColor: "rgba(196,163,90,0.08)",
            cursor: "pointer",
            width: "100%",
            textAlign: "right",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(196,163,90,0.08)",
              border: "1px solid rgba(196,163,90,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i
              className="fa-solid fa-message"
              style={{ color: "#C4A35A", fontSize: "14px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "13px",
                fontWeight: 500,
                color: "#F2EFE8",
              }}
            >
              {claim.item.title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-outfit)",
                fontSize: "11px",
                color: "#7A7A8C",
                marginTop: "2px",
              }}
            >
              {formatDate(claim.createdAt)}
            </p>
          </div>
          <span
            style={{
              fontFamily: "var(--font-outfit)",
              fontSize: "10px",
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#C4A35A",
            }}
          >
            فتح{" "}
            <i
              className="fa-solid fa-arrow-left"
              style={{ fontSize: "10px" }}
            />
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
    { key: "listings" as const, label: "بلاغاتي", count: listings.length },
    { key: "claims" as const, label: "مطالباتي", count: claims.length },
    {
      key: "messages" as const,
      label: "الرسائل",
      count: claims.filter((c) => c.status === "ACCEPTED").length,
    },
  ];

  const emptyStyle = {
    fontFamily: "var(--font-outfit)",
    fontSize: "12px",
    color: "#7A7A8C",
    textAlign: "center" as const,
    padding: "40px 0",
  };

  return (
    <div
      style={{
        background: "#13131F",
        border: "1px solid rgba(196,163,90,0.18)",
        borderRadius: "4px",
      }}
    >
      {/* Tab Headers */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(196,163,90,0.15)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: "18px 24px",
              fontFamily: "var(--font-outfit)",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "2px",
              textTransform: "uppercase",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              borderBottom:
                activeTab === tab.key
                  ? "2px solid #C4A35A"
                  : "2px solid transparent",
              color: activeTab === tab.key ? "#C4A35A" : "#7A7A8C",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                style={{
                  marginRight: "8px",
                  background: "rgba(196,163,90,0.1)",
                  color: "#C4A35A",
                  border: "1px solid rgba(196,163,90,0.2)",
                  padding: "2px 8px",
                  borderRadius: "40px",
                  fontSize: "10px",
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* My Listings */}
      {activeTab === "listings" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {listings.length === 0 ? (
            <p style={emptyStyle}>لم تنشر أي بلاغ بعد</p>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(196,163,90,0.08)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background:
                        item.status === "ACTIVE" ? "#8AABF0" : "#7DC99A",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "13px",
                        fontWeight: 500,
                        color: "#F2EFE8",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-outfit)",
                        fontSize: "11px",
                        color: "#7A7A8C",
                        marginTop: "2px",
                      }}
                    >
                      {formatDate(item.createdAt)} ·{" "}
                      <i
                        className={`fa-solid ${item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"}`}
                      />{" "}
                      {item.type === "LOST" ? "مفقود" : "موجود"} ·{" "}
                      {item._count.claims} مطالبة
                    </p>
                  </div>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <StatusBadge status={item.status} />
                  <Link
                    href={`/items/${item.id}`}
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#C4A35A",
                      textDecoration: "none",
                    }}
                  >
                    عرض
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* My Claims */}
      {activeTab === "claims" && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {claims.length === 0 ? (
            <p style={emptyStyle}>لم تقم بأي مطالبة بعد</p>
          ) : (
            claims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(196,163,90,0.08)",
                }}
              >
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#F2EFE8",
                    }}
                  >
                    {claim.item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "11px",
                      color: "#7A7A8C",
                      marginTop: "2px",
                    }}
                  >
                    {formatDate(claim.createdAt)} ·{" "}
                    <i
                      className={`fa-solid ${claim.item.type === "LOST" ? "fa-magnifying-glass" : "fa-box"}`}
                    />{" "}
                    {claim.item.type === "LOST" ? "مفقود" : "موجود"}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <StatusBadge
                    status={claim.status}
                    rejectedBy={claim.rejectedBy}
                  />
                  <Link
                    href={`/items/${claim.item.id}`}
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "10px",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: "#C4A35A",
                      textDecoration: "none",
                    }}
                  >
                    عرض
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
