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
        style={{
          display: "block",
          textAlign: "center",
          fontFamily: "var(--font-outfit)",
          fontSize: "18px",
          fontWeight: 500,
          letterSpacing: "2px",
          textTransform: "uppercase",
          padding: "14px 32px",
          borderRadius: "2px",
          background: "#C4A35A",
          color: "#080810",
        }}
      >
        سجّل الدخول للمطالبة بهذا الغرض
      </Link>
    );
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError("يرجى إدخال الإجابة");
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
      toast.success("إجابة صحيحة! تم إرسال مطالبتك ✓");
    } else if (response.status === "REJECTED") {
      toast.error("استنفدت جميع المحاولات ✕");
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
        style={{
          width: "100%",
          fontFamily: "var(--font-outfit)",
          fontSize: "18px",
          fontWeight: 500,
          letterSpacing: "2px",
          textTransform: "uppercase",
          padding: "14px 32px",
          borderRadius: "2px",
          background: "#C4A35A",
          color: "#080810",
          border: "none",
          cursor: "pointer",
        }}
      >
        {itemType === "FOUND" ? "أنا صاحب هذا الغرض" : "أنا وجدت هذا الغرض"}
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.7)",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              background: "#13131F",
              border: "1px solid rgba(196,163,90,0.2)",
              borderRadius: "4px",
              padding: "32px",
            }}
          >
            {result ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                  {result.isCorrect ? "✅" : "❌"}
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: "28px",
                    fontWeight: 400,
                    color: "#F2EFE8",
                    marginBottom: "8px",
                  }}
                >
                  {result.isCorrect ? "إجابة صحيحة!" : "إجابة خاطئة"}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "15px",
                    color: "#7A7A8C",
                    marginBottom: "24px",
                    lineHeight: 1.6,
                  }}
                >
                  {result.isCorrect
                    ? "تم إرسال طلبك. سيتواصل معك صاحب البلاغ قريباً."
                    : result.status === "REJECTED"
                      ? "لقد استنفدت جميع محاولاتك."
                      : `إجابة غير صحيحة. تبقّى لك ${result.attemptsLeft} محاولة.`}
                </p>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setResult(null);
                    setAnswer("");
                  }}
                  style={{
                    width: "100%",
                    fontFamily: "var(--font-outfit)",
                    fontSize: "18px",
                    fontWeight: 500,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    padding: "12px",
                    borderRadius: "2px",
                    background: "#C4A35A",
                    color: "#080810",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <>
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: "28px",
                    fontWeight: 400,
                    color: "#F2EFE8",
                    marginBottom: "8px",
                  }}
                >
                  {itemType === "FOUND"
                    ? "أثبت أنك المالك"
                    : "أثبت أنك وجدت الغرض"}
                </h2>
                <p
                  style={{
                    fontFamily: "var(--font-outfit)",
                    fontSize: "14px",
                    color: "#7A7A8C",
                    marginBottom: "20px",
                    lineHeight: 1.6,
                  }}
                >
                  {itemType === "FOUND"
                    ? "أجب على السؤال لإثبات ملكيتك:"
                    : "أجب على السؤال لإثبات أنك تحمل الغرض:"}
                </p>

                <div
                  style={{
                    background: "rgba(196,163,90,0.06)",
                    border: "1px solid rgba(196,163,90,0.2)",
                    borderRadius: "2px",
                    padding: "16px",
                    marginBottom: "16px",
                    fontFamily: "var(--font-outfit)",
                    fontSize: "15px",
                    color: "#C4A35A",
                    lineHeight: 1.6,
                  }}
                >
                  {secretQuestion}
                </div>

                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                  placeholder="إجابتك..."
                  style={{
                    width: "100%",
                    background: "#0F0F1A",
                    border: "1px solid rgba(196,163,90,0.18)",
                    borderRadius: "2px",
                    padding: "12px 16px",
                    fontFamily: "var(--font-outfit)",
                    fontSize: "15px",
                    color: "#F2EFE8",
                    outline: "none",
                    marginBottom: "8px",
                  }}
                />

                {error && (
                  <p
                    style={{
                      fontFamily: "var(--font-outfit)",
                      fontSize: "14px",
                      color: "#D48080",
                      marginBottom: "12px",
                    }}
                  >
                    {error}
                  </p>
                )}

                <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setAnswer("");
                      setError(null);
                    }}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-outfit)",
                      fontSize: "12px",
                      fontWeight: 400,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "12px",
                      borderRadius: "2px",
                      background: "transparent",
                      color: "#7A7A8C",
                      border: "1px solid rgba(196,163,90,0.2)",
                      cursor: "pointer",
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-outfit)",
                      fontSize: "12px",
                      fontWeight: 500,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                      padding: "12px",
                      borderRadius: "2px",
                      background: "#C4A35A",
                      color: "#080810",
                      border: "none",
                      cursor: "pointer",
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    {isLoading ? "جارٍ التحقق..." : "تحقق"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
