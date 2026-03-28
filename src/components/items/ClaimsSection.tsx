"use client";

import { useState, useTransition } from "react";
import { respondToClaim } from "@/actions/item.actions";
import ChatButton from "@/components/chat/ChatButton";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { toast } from "sonner";
import { Star } from "lucide-react";

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
        response === "ACCEPTED" ? "Claim accepted ✓" : "Claim rejected",
      );
      setLoadingId(null);
    });
  }

  if (claims.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-gold/20 rounded-lg py-12 text-center bg-void/20">
        <p className="font-interface text-xs text-slate tracking-widest uppercase opacity-60">
          No claims yet
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-display text-2xl font-light text-ivory">
          Incoming Claims
        </h2>
        <span className="font-interface text-xs font-bold tracking-xs uppercase px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/25">
          {pendingClaims.length} Pending
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="flex items-center justify-between px-6 py-4 bg-void border border-gold/15 rounded-xl hover:border-gold/30 transition-all shadow-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center font-interface text-sm font-medium text-gold shrink-0 transition-transform group-hover:scale-105">
                {claim.claimant.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-interface text-sm font-medium text-ivory transition-colors group-hover:text-gold">
                  {claim.claimant.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="font-interface text-[11px] text-slate">
                    <Star
                      className="w-3 h-3 text-gold mr-1 fill-gold"
                      strokeWidth={0}
                    />{" "}
                    {claim.claimant.trustScore}
                  </p>
                  <span className="font-interface text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    · Provided correct answer ✅
                  </span>
                </div>
              </div>
            </div>

            {claim.status === "PENDING" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(claim.id, "ACCEPTED")}
                  disabled={isPending}
                  className="font-interface text-xs font-bold tracking-xs uppercase px-5 py-2 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all shadow-md shadow-gold/10 disabled:opacity-50 flex items-center justify-center min-h-[36px]"
                >
                  {loadingId === claim.id ? (
                    <div className="scale-[0.8] origin-center">
                      <ButtonLoader />
                    </div>
                  ) : (
                    "Accept"
                  )}
                </button>
                <button
                  onClick={() => handleRespond(claim.id, "REJECTED")}
                  disabled={isPending}
                  className="font-interface text-xs font-bold tracking-xs uppercase px-5 py-2 rounded-full bg-transparent text-red-400 border border-red-400/20 hover:bg-red-400/5 transition-all disabled:opacity-50 flex items-center justify-center min-h-[36px]"
                >
                  {loadingId === claim.id ? (
                    <div className="scale-[0.8] origin-center">
                      <ButtonLoader />
                    </div>
                  ) : (
                    "Reject"
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`font-interface text-xs font-bold tracking-xs uppercase px-4 py-1.5 rounded-full border ${
                    claim.status === "ACCEPTED"
                      ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/5 text-red-400 border-red-500/20"
                  }`}
                >
                  {claim.status === "ACCEPTED" ? "Accepted ✓" : "Rejected ✕"}
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
