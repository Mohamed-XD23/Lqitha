"use client";

import { useState, type ReactNode } from "react";
import { submitClaim } from "@/actions/item.actions";
import Link from "next/link";
import { toast } from "sonner";
import ButtonLoader from "@/components/ui/ButtonLoader";
import {
  CircleCheck,
  Ban,
  CircleX,
  Clock,
  AlertTriangle,
  RotateCcw, 
} from "lucide-react";
import { Dictionary } from "@/lib/dictionary.types";

function fillTemplate(template: string, placeholder: string, value: string) {
  return template.replace(placeholder, value);
}

function ClaimStatusBanner({
  icon,
  title,
  message,
  tone = "gold",
}: {
  icon: ReactNode;
  title: string;
  message: string;
  tone?: "green" | "red" | "gold";
}) {
  const toneStyles = {
    green: {
      container:
        "border border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
      iconWrap: "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20",
    },
    red: {
      container: "border border-red-400/20 bg-red-400/8 text-red-300",
      iconWrap: "bg-red-400/10 text-red-300 ring-1 ring-red-400/20",
    },
    gold: {
      container: "border border-gold/20 bg-gold/8 text-gold",
      iconWrap: "bg-gold/10 text-gold ring-1 ring-gold/20",
    },
  } as const;

  const styles = toneStyles[tone];

  return (
    <div
      className={`rounded-[2rem] px-5 py-4 text-center shadow-[0_12px_35px_rgba(0,0,0,0.18)] ${styles.container}`}
    >
      <div className="flex items-center justify-center gap-2.5">
        <span
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}
        >
          {icon}
        </span>
        <span className="font-interface text-[12px] font-semibold uppercase tracking-[2px]">
          {title}
        </span>
      </div>
      <p className="mt-2 text-center font-interface text-[11px] leading-relaxed text-slate">
        {message}
      </p>
    </div>
  );
}

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
  dict: Dictionary;
}

export default function ClaimButton({
  itemId,
  itemType,
  isLoggedIn,
  secretQuestion,
  claimStatus,
  dict,
}: ClaimButtonProps) {
  const t = dict.claim;
  const [showModal, setShowModal] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    isCorrect: boolean;
    status: string;
    attemptsLeft: number;
  } | null>(null);
  const [currentStatus, setCurrentStatus] = useState<ClaimStatus | null>(
    claimStatus,
  );

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="block text-center font-interface text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20"
      >
        {t.signReq}
      </Link>
    );
  }

  // Already ACCEPTED
  if (currentStatus?.status === "ACCEPTED") {
    return (
      <ClaimStatusBanner
        icon={<CircleCheck className="h-4 w-4" strokeWidth={2.25} />}
        title={t.claimAccepted}
        message={t.claimMsg}
        tone="green"
      />
    );
  }

  // REJECTED by system (exhausted)
  if (
    currentStatus?.status === "REJECTED" &&
    currentStatus.rejectedBy === "system"
  ) {
    return (
      <ClaimStatusBanner
        icon={<Ban className="h-4 w-4" strokeWidth={2.25} />}
        title={t.noAttempts}
        message={fillTemplate(
          t.attemptsUsed,
          "{currentStatus.maxAttempts}",
          String(currentStatus.maxAttempts),
        )}
        tone="red"
      />
    );
  }

  // REJECTED by owner
  if (
    currentStatus?.status === "REJECTED" &&
    currentStatus.rejectedBy === "owner"
  ) {
    return (
      <ClaimStatusBanner
        icon={<CircleX className="h-4 w-4" strokeWidth={2.25} />}
        title={t.claimRejected}
        message={t.claimMsgRej}
        tone="red"
      />
    );
  }

  // PENDING + isVerified (awaiting owner)
  if (currentStatus?.status === "PENDING" && currentStatus.isVerified) {
    return (
      <ClaimStatusBanner
        icon={<Clock className="h-4 w-4" strokeWidth={2.25} />}
        title={t.AwaitingResponse}
        message={t.claimSubmitted}
        tone="gold"
      />
    );
  }

  // PENDING + wrong answer + attempts left
  const attemptsLeft =
    currentStatus?.attemptsLeft ?? currentStatus?.maxAttempts ?? 3;
  const hasExistingClaim = !!currentStatus;

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError(t.error.noAnswer);
      return;
    }
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
      toast.success(t.toast.claimAccepted);
    } else if (response.status === "REJECTED") {
      toast.error(t.toast.attemptsExhausted);
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
    toast.success(t.toast.claimSuccessful);
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
          onClick={() =>
            secretQuestion ? setShowModal(true) : void handleQuickClaim()
          }
          disabled={isLoading}
          className="w-full font-interface text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {itemType === "FOUND" ? t.Buttons.owner : t.Buttons.found}
        </button>

        {/* Show attempts warning if previous wrong answer */}
        {hasExistingClaim &&
          currentStatus?.status === "PENDING" &&
          !currentStatus.isVerified && (
            <div className="flex justify-center gap-2 mt-1.5 items-center font-interface text-xs text-gold text-center tracking-tighter">
              {t.attemptsRemain} &nbsp; {attemptsLeft}
              <AlertTriangle
                className="w-3.5 h-3.5 mr-1.5 text-ivory/60"
                strokeWidth={2.5}
              />
            </div>
          )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-void border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/50 to-transparent" />

            {result ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-6">
                  {result.isCorrect ? <CircleCheck/> : <Ban/>}
                </div>
                <span className="font-display text-gold text-lg font-light tracking-widest uppercase">
                  {result.isCorrect ? t.correctAnswer : t.incorrectAnswer}
                </span>
                <p className="font-interface text-sm text-slate mb-8 leading-relaxed max-w-70 mx-auto">
                  {result.isCorrect
                    ? t.requestSentSuccess
                    : result.status === "REJECTED"
                      ? t.attemptsExhausted
                      : fillTemplate(
                          t.attemptsRemaining,
                          "${result.attemptsLeft}",
                          String(result.attemptsLeft),
                        )}
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult(null);
                    setAnswer("");
                  }}
                  className="w-full font-interface text-[11px] font-bold tracking-xs uppercase py-3 rounded-full bg-gold text-obsidian hover:bg-ivory transition-all"
                >
                  {t.Buttons.close}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-display text-3xl font-light text-ivory">
                    {itemType === "FOUND"
                      ? t.ownershipProve
                      : t.possessionProve}
                  </h2>
                  <p className="font-interface text-[11px] text-gold/60 uppercase tracking-widest font-medium">
                    {itemType === "FOUND" ? t.verifyQues : t.handoverProof}
                  </p>
                </div>

                {/* Attempts indicator */}
                {hasExistingClaim && (
                  <div
                    style={{
                      background: "rgba(196,163,90,0.06)",
                      border: "1px solid rgba(196,163,90,0.15)",
                      borderRadius: "8px",
                      padding: "10px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <RotateCcw
                      className="w-3.5 h-3.5 text-slate"
                      strokeWidth={2.5}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-interface)",
                        fontSize: "11px",
                        color: "#C4A35A",
                      }}
                    >
                      {t.attemptsRemain} &nbsp; {attemptsLeft}
                    </span>
                  </div>
                )}

                <div className="bg-obsidian border border-gold/15 rounded-xl p-5 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/50 rounded-l-xl" />
                  <p className="font-interface text-sm text-ivory leading-relaxed">
                    {secretQuestion}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSubmitAnswer()
                      }
                      placeholder={t.questionAnsPlaceholder}
                      className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/40 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-interface"
                    />
                  </div>

                  {error && (
                    <p className="font-interface text-xs text-red-400">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setAnswer("");
                        setError(null);
                      }}
                      className="flex-1 font-interface text-[11px] font-bold tracking-xs uppercase py-3 rounded-full border border-gold/20 text-slate hover:bg-gold/5 transition-all"
                    >
                      {t.Buttons.cancel}
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isLoading}
                      className="flex flex-1 h-11 items-center justify-center rounded-full bg-gold font-interface text-[11px] font-bold leading-none tracking-xs uppercase text-void transition-all shadow-lg shadow-gold/20 hover:bg-ivory disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="inline-flex items-center justify-center leading-none">
                          <ButtonLoader />
                        </div>
                      ) : (
                        t.Buttons.confirm
                      )}
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
