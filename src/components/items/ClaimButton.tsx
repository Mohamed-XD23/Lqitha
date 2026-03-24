"use client";

import { useState } from "react";
import { submitClaim } from "@/actions/item.actions";
import Link from "next/link";
import { toast } from "sonner";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { CircleCheck, Ban, CircleX, Clock, AlertTriangle, RotateCcw } from "lucide-react";

interface ClaimStatus {
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  isVerified: boolean;
  rejectedBy: string | null;
  attemptsUsed: number;
  maxAttempts: number;
  attemptsLeft: number;
}

interface ClaimButtonProps {
  itemId: string;
  itemType: "LOST" | "FOUND";
  isLoggedIn: boolean;
  secretQuestion: string | null;
  claimStatus: ClaimStatus | null;
}

export default function ClaimButton({
  itemId,
  itemType,
  isLoggedIn,
  secretQuestion,
  claimStatus,
}: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    status: string;
    attemptsLeft: number;
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ClaimStatus | null>(claimStatus);

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="block text-center font-interface text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20"
      >
        Sign in to claim this item
      </Link>
    );
  }

  // Already ACCEPTED
  if (currentStatus?.status === "ACCEPTED") {
    return (
      <div style={{ background: "rgba(100,200,130,0.08)", border: "1px solid rgba(100,200,130,0.25)", borderRadius: "999px", padding: "16px", textAlign: "center" }}>
        <CircleCheck className="w-5 h-5 mr-2 text-[#7DC99A]" strokeWidth={2} />
        <span style={{ fontFamily: "var(--font-interface)", fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#7DC99A" }}>
          Claim Accepted
        </span>
        <p style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#7A7A8C", marginTop: "6px" }}>
          The owner accepted your claim. Check your messages.
        </p>
      </div>
    );
  }

  // REJECTED by system (exhausted)
  if (currentStatus?.status === "REJECTED" && currentStatus.rejectedBy === "system") {
    return (
      <div style={{ background: "rgba(200,100,100,0.08)", border: "1px solid rgba(200,100,100,0.25)", borderRadius: "999px", padding: "16px", textAlign: "center" }}>
        <Ban className="w-5 h-5 mr-2 text-[#D48080]" strokeWidth={2} />
        <span style={{ fontFamily: "var(--font-interface)", fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#D48080" }}>
          No Attempts Remaining
        </span>
        <p style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#7A7A8C", marginTop: "6px" }}>
          You have used all {currentStatus.maxAttempts} attempts for this item.
        </p>
      </div>
    );
  }

  // REJECTED by owner
  if (currentStatus?.status === "REJECTED" && currentStatus.rejectedBy === "owner") {
    return (
      <div style={{ background: "rgba(200,100,100,0.08)", border: "1px solid rgba(200,100,100,0.25)", borderRadius: "999px", padding: "16px", textAlign: "center" }}>
        <CircleX className="w-5 h-5 mr-2 text-[#D48080]" strokeWidth={2} />
        <span style={{ fontFamily: "var(--font-interface)", fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#D48080" }}>
          Claim Rejected
        </span>
        <p style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#7A7A8C", marginTop: "6px" }}>
          The owner has rejected your claim.
        </p>
      </div>
    );
  }

  // PENDING + isVerified (awaiting owner)
  if (currentStatus?.status === "PENDING" && currentStatus.isVerified) {
    return (
      <div style={{ background: "rgba(196,163,90,0.08)", border: "1px solid rgba(196,163,90,0.25)", borderRadius: "999px", padding: "16px", textAlign: "center" }}>
        <Clock className="w-5 h-5 mr-2 text-ivory/70" strokeWidth={2} />
        <span style={{ fontFamily: "var(--font-interface)", fontSize: "12px", fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase", color: "#C4A35A" }}>
          Awaiting Owner Response
        </span>
        <p style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#7A7A8C", marginTop: "6px" }}>
          Your claim has been submitted successfully.
        </p>
      </div>
    );
  }

  // PENDING + wrong answer + attempts left
  const attemptsLeft = currentStatus?.attemptsLeft ?? currentStatus?.maxAttempts ?? 3;
  const hasExistingClaim = !!currentStatus;

  async function handleSubmitAnswer() {
    if (!answer.trim()) { setError("Please enter an answer"); return; }
    setIsLoading(true);
    setError(null);
    const response = await submitClaim(itemId, answer);
    if ("error" in response && response.error) {
      toast.error(response.error);
      setError(response.error);
      setIsLoading(false);
      return;
    }
    if (!("success" in response) || !response.success) {
      setIsLoading(false);
      return;
    }
    if (response.isCorrect) {
      toast.success("Correct answer! Your claim has been sent.");
    } else if (response.status === "REJECTED") {
      toast.error("You have exhausted all attempts.");
    }
    setResult({
      isCorrect: response.isCorrect,
      status: response.status,
      attemptsLeft: response.attemptsLeft,
    });
    // Update local status
    setCurrentStatus({
      status: response.status as "PENDING" | "ACCEPTED" | "REJECTED",
      isVerified: response.isCorrect,
      rejectedBy: response.status === "REJECTED" ? "system" : null,
      attemptsUsed: (currentStatus?.attemptsUsed ?? 0) + 1,
      maxAttempts: currentStatus?.maxAttempts ?? 3,
      attemptsLeft: response.attemptsLeft,
    });
    setIsLoading(false);
  }

  async function handleQuickClaim() {
    setIsLoading(true);
    setError(null);
    const response = await submitClaim(itemId, "");
    if ("error" in response && response.error) {
      toast.error(response.error);
      setError(response.error);
      setIsLoading(false);
      return;
    }
    if (!("success" in response) || !response.success) {
      setIsLoading(false);
      return;
    }
    toast.success("Your claim has been sent successfully.");
    setCurrentStatus({
      status: response.status as "PENDING" | "ACCEPTED" | "REJECTED",
      isVerified: response.isCorrect,
      rejectedBy: response.status === "REJECTED" ? "system" : null,
      attemptsUsed: (currentStatus?.attemptsUsed ?? 0) + 1,
      maxAttempts: currentStatus?.maxAttempts ?? 3,
      attemptsLeft: response.attemptsLeft,
    });
    setIsLoading(false);
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => secretQuestion ? setShowModal(true) : void handleQuickClaim()}
          disabled={isLoading}
          className="w-full font-interface text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {itemType === "FOUND" ? "I am the owner" : "I found this item"}
        </button>

        {/* Show attempts warning if previous wrong answer */}
        {hasExistingClaim && currentStatus?.status === "PENDING" && !currentStatus.isVerified && (
          <p style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#C4A35A", textAlign: "center", letterSpacing: "1px" }}>
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-ivory/60" strokeWidth={2.5} />
            {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
          </p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-void border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/50 to-transparent" />

            {result ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-6">
                  {result.isCorrect ? "OK" : "NO"}
                </div>
                <span className="font-display text-gold text-lg font-light tracking-widest uppercase">
                  {result.isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                </span>
                <p className="font-interface text-sm text-slate mb-8 leading-relaxed max-w-[280px] mx-auto">
                  {result.isCorrect
                    ? "Your request has been sent successfully. The owner will contact you soon."
                    : result.status === "REJECTED"
                      ? "You have exhausted all your attempts for this item."
                      : `Incorrect answer. You have ${result.attemptsLeft} attempts remaining.`}
                </p>
                <button
                  onClick={() => { setShowModal(false); setResult(null); setAnswer(""); }}
                  className="w-full font-interface text-[11px] font-bold tracking-xs uppercase py-3 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl font-light text-ivory">
                    {itemType === "FOUND" ? "Prove Ownership" : "Prove Possession"}
                  </h2>
                  <p className="font-interface text-[11px] text-gold/60 uppercase tracking-widest font-medium">
                    {itemType === "FOUND" ? "Verification Question" : "Handover Proof"}
                  </p>
                </div>

                {/* Attempts indicator */}
                {hasExistingClaim && (
                  <div style={{ background: "rgba(196,163,90,0.06)", border: "1px solid rgba(196,163,90,0.15)", borderRadius: "8px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <RotateCcw className="w-3.5 h-3.5 text-slate" strokeWidth={2.5} />
                    <span style={{ fontFamily: "var(--font-interface)", fontSize: "11px", color: "#C4A35A" }}>
                      {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
                    </span>
                  </div>
                )}

                <div className="bg-obsidian border border-gold/15 rounded-xl p-5 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/50 rounded-l-xl" />
                  <p className="font-interface text-sm text-ivory leading-relaxed">{secretQuestion}</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                      placeholder="Type your answer here..."
                      className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/40 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-interface"
                    />
                  </div>

                  {error && <p className="font-interface text-xs text-red-400">{error}</p>}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => { setShowModal(false); setAnswer(""); setError(null); }}
                      className="flex-1 font-interface text-[11px] font-bold tracking-xs uppercase py-3 rounded-full border border-gold/20 text-slate hover:bg-gold/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isLoading}
                      className="flex-1 font-interface text-[11px] font-bold tracking-xs uppercase py-3 rounded-full bg-gold text-void hover:bg-ivory transition-all shadow-lg shadow-gold/20 disabled:opacity-50 flex items-center justify-center min-h-[44px]"
                    >
                      {isLoading ? <div className="scale-[1] origin-center"><ButtonLoader /></div> : "Confirm Answer"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


