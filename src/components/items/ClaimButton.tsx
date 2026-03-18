"use client";

import { useState } from "react";
import { submitClaim } from "@/actions/item.actions";
import Link from "next/link";
import { toast } from "sonner";

interface ClaimButtonProps {
  itemId: string;
  itemType: "LOST" | "FOUND";
  isLoggedIn: boolean;
  secretQuestion: string | null;
}

export default function ClaimButton({
  itemId,
  itemType,
  isLoggedIn,
  secretQuestion,
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

  if (!isLoggedIn) {
    return (
      <Link
        href="/login"
        className="block text-center font-outfit text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-void hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20"
      >
        Sign in to claim this item
      </Link>
    );
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError("Please enter an answer");
      return;
    }
    setIsLoading(true);
    setError(null);
    const response = await submitClaim(itemId, answer);
    if (response.error) {
      toast.error(response.error);
      setError(response.error);
      setIsLoading(false);
      return;
    }
    if (response.isCorrect) {
      toast.success("Correct answer! Your claim has been sent ✓");
    } else if (response.status === "REJECTED") {
      toast.error("You have exhausted all attempts ✕");
    }
    setResult({
      isCorrect: response.isCorrect!,
      status: response.status!,
      attemptsLeft: response.attemptsLeft!,
    });
    setIsLoading(false);
  }

  return (
    <>
      <button
        onClick={() =>
          secretQuestion ? setShowModal(true) : submitClaim(itemId, "")
        }
        className="w-full font-outfit text-sm font-bold tracking-[3px] uppercase py-4 rounded-full bg-gold text-void hover:bg-ivory transition-all duration-300 shadow-lg shadow-gold/20 cursor-pointer"
      >
        {itemType === "FOUND" ? "I am the owner" : "I found this item"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-void border border-gold/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
            
            {result ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-6 animate-bounce">
                  {result.isCorrect ? "✨" : "🚫"}
                </div>
                <h2 className="font-cormorant text-3xl font-light text-ivory mb-3">
                  {result.isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                </h2>
                <p className="font-outfit text-sm text-slate mb-8 leading-relaxed max-w-[280px] mx-auto">
                  {result.isCorrect
                    ? "Your request has been sent successfully. The owner will contact you soon."
                    : result.status === "REJECTED"
                      ? "You have exhausted all your attempts for this item."
                      : `Incorrect answer. You have ${result.attemptsLeft} attempts remaining.`}
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult(null);
                    setAnswer("");
                  }}
                  className="w-full font-outfit text-[11px] font-bold tracking-[2px] uppercase py-3 rounded-full bg-gold text-void hover:bg-ivory transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="font-cormorant text-3xl font-light text-ivory">
                    {itemType === "FOUND"
                      ? "Prove Ownership"
                      : "Prove Possession"}
                  </h2>
                  <p className="font-outfit text-[11px] text-gold/60 uppercase tracking-widest font-medium">
                    {itemType === "FOUND"
                      ? "Verification Question"
                      : "Handover Proof"}
                  </p>
                </div>

                <div className="bg-obsidian border border-gold/15 rounded-xl p-5 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold/50" />
                  <p className="font-outfit text-sm text-ivory leading-relaxed">
                    {secretQuestion}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                      placeholder="Type your answer here..."
                      className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/40 outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all font-outfit"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/20">
                      <i className="fa-solid fa-pen-nib text-[10px]" />
                    </div>
                  </div>

                  {error && (
                    <p className="font-outfit text-xs text-red-400 animate-pulse">
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
                      className="flex-1 font-outfit text-[11px] font-bold tracking-[2px] uppercase py-3 rounded-full border border-gold/20 text-slate hover:bg-gold/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={isLoading}
                      className="flex-1 font-outfit text-[11px] font-bold tracking-[2px] uppercase py-3 rounded-full bg-gold text-void hover:bg-ivory transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                    >
                      {isLoading ? "Verifying..." : "Confirm Answer"}
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
