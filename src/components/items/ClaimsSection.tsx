"use client";

import { useState, useTransition } from "react";
import { respondToClaim } from "@/actions/item.actions";
import ChatButton from "@/components/chat/ChatButton";
import { toast } from "sonner";

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
  ownerId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string | null;
}

export default function ClaimsSection({
  claims,
  itemId,
  ownerId,
  currentUserId,
  currentUserName,
  currentUserImage,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const pendingClaims = claims.filter((c) => c.status === "PENDING");

  function handleRespond(claimId: string, response: "ACCEPTED" | "REJECTED") {
    setLoadingId(claimId);
    startTransition(async () => {
      await respondToClaim(claimId, itemId, response);
      toast.success(
        response === "ACCEPTED" ? "تم قبول المطالبة ✓" : "تم رفض المطالبة",
      );
      setLoadingId(null);
    });
  }

  if (claims.length === 0) {
    return (
      <div
        style={{
          marginTop: "40px",
          border: "1px dashed rgba(196,163,90,0.2)",
          borderRadius: "2px",
          padding: "32px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "12px",
            color: "#7A7A8C",
            letterSpacing: "1px",
          }}
        >
          لا توجد مطالبات بعد
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "48px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "28px",
            fontWeight: 400,
            color: "#F2EFE8",
          }}
        >
          المطالبات الواردة
        </h2>
        <span
          style={{
            fontFamily: "var(--font-outfit)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "2px",
            padding: "4px 12px",
            borderRadius: "40px",
            background: "rgba(196,163,90,0.1)",
            color: "#C4A35A",
            border: "1px solid rgba(196,163,90,0.25)",
          }}
        >
          {pendingClaims.length} معلقة
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {claims.map((claim) => (
          <div
            key={claim.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: "#13131F",
              border: "1px solid rgba(196,163,90,0.15)",
              borderRadius: "2px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(196,163,90,0.1)",
                  border: "1px solid rgba(196,163,90,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-outfit)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#C4A35A",
                  flexShrink: 0,
                }}
              >
                {claim.claimant.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#F2EFE8",
                  }}
                >
                  {claim.claimant.name}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "11px",
                    color: "#7A7A8C",
                    marginTop: "2px",
                  }}
                >
                  <i className="fa-solid fa-star mr-1" /> {claim.claimant.trustScore} · أجاب الإجابة الصحيحة ✅
                </p>
              </div>
            </div>

            {claim.status === "PENDING" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => handleRespond(claim.id, "ACCEPTED")}
                  disabled={isPending}
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "8px 18px",
                    borderRadius: "2px",
                    background: "#C4A35A",
                    color: "#080810",
                    border: "none",
                    cursor: "pointer",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  {loadingId === claim.id ? "..." : "قبول"}
                </button>
                <button
                  onClick={() => handleRespond(claim.id, "REJECTED")}
                  disabled={isPending}
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "10px",
                    fontWeight: 400,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "8px 18px",
                    borderRadius: "2px",
                    background: "transparent",
                    color: "#D48080",
                    border: "1px solid rgba(200,100,100,0.25)",
                    cursor: "pointer",
                    opacity: isPending ? 0.5 : 1,
                  }}
                >
                  {loadingId === claim.id ? "..." : "رفض"}
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "10px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "5px 12px",
                    borderRadius: "40px",
                    background:
                      claim.status === "ACCEPTED"
                        ? "rgba(100,200,130,0.08)"
                        : "rgba(200,100,100,0.08)",
                    color: claim.status === "ACCEPTED" ? "#7DC99A" : "#D48080",
                    border:
                      claim.status === "ACCEPTED"
                        ? "1px solid rgba(100,200,130,0.2)"
                        : "1px solid rgba(200,100,100,0.2)",
                  }}
                >
                  {claim.status === "ACCEPTED" ? "مقبول ✓" : "مرفوض ✕"}
                </span>
                {claim.status === "ACCEPTED" && (
                  <ChatButton
                    claimId={claim.id}
                    ownerId={ownerId}
                    claimantId={claim.claimant.id}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserImage={currentUserImage}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
