"use client";

import { useState, useTransition } from "react";
import { respondToClaim } from "@/actions/item.actions";
import ChatButton from "@/components/chat/ChatButton";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Dictionary } from "@/lib/dictionary.types";
import { Check } from 'lucide-react';

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
  dict: Dictionary
}

export default function ClaimsSection({
  claims,
  itemId,
  ownerId,
  currentUserId,
  currentUserName,
  currentUserImage,
  dict,
}: Props) {
  const t = dict.claim;
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
      <div className="mt-10 border border-dashed border-primary/20 rounded-lg py-12 text-center bg-card/20">
        <p className="font-interface text-xs text-muted-foreground tracking-widest uppercase opacity-60">
          {t.noClaims}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="font-display text-2xl font-light text-foreground">
          {t.incoming}
        </h2>
        <span className="font-interface text-xs font-bold tracking-xs uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25">
          {pendingClaims.length} {t.pending}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {claims.map((claim) => (
          <div
            key={claim.id}
            className="flex items-center justify-between px-6 py-4 bg-card border border-primary/15 rounded-xl hover:border-primary/30 transition-all shadow-lg group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-interface text-sm font-medium text-primary shrink-0 transition-transform group-hover:scale-105">
                {claim.claimant.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div>
                <p className="font-interface text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                  {claim.claimant.name}
                </p>
                <div className="flex items-center  gap-2 mt-0.5">
                  <p className="flex items-center gap-0.5 font-interface text-xs text-muted-foreground">
                    <Star
                      className="w-4 h-4 text-primary fill-primary"
                      strokeWidth={0}
                    />{" "}
                    {claim.claimant.trustScore}
                  </p>
                  <span className=" flex items-center gap-1 font-interface text-xs text-emerald-400 font-bold uppercase tracking-wider">
                    {t.providedAnswer} 
                    <Check 
                    className="w-6 h-6"
                    />
                  </span>
                </div>
              </div>
            </div>

            {claim.status === "PENDING" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleRespond(claim.id, "ACCEPTED")}
                  disabled={isPending}
                  className="font-interface text-xs font-bold tracking-xs uppercase px-5 py-2 rounded-full bg-primary text-background hover:bg-foreground transition-all shadow-md shadow-primary/10 disabled:opacity-50 flex items-center justify-center min-h-[36px]"
                >
                  {loadingId === claim.id ? (
                    <div className="scale-[0.8] origin-center">
                      <ButtonLoader />
                    </div>
                  ) : (
                    t.accept
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
                    t.reject
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
                  {claim.status === "ACCEPTED" ? t.accepted : t.rejected}
                </span>
                {claim.status === "ACCEPTED" && (
                  <ChatButton
                    claimId={claim.id}
                    ownerId={ownerId}
                    claimantId={claim.claimant.id}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserImage={currentUserImage}
                    dict={dict}
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
