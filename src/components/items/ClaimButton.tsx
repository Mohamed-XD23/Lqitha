"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ClaimButtonProps {
  itemId: string;
  isLoggedIn: boolean;
  secretQuestion: string | null;
}

export default function ClaimButton({ 
  itemId, 
  isLoggedIn, 
  secretQuestion 
}: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // إذا لم يكن مسجّلاً نوجّهه لصفحة تسجيل الدخول
  if (!isLoggedIn) {
    return (
      <a href="/login"
        className="block w-full rounded-xl bg-black py-3 text-center text-sm font-semibold text-white hover:bg-gray-800">
        سجّل الدخول للمطالبة بهذا الغرض
      </a>
    );
  }

  async function handleClaim() {
    // إذا لم يكن هناك سؤال سري (LOST item) نرسل المطالبة مباشرةً
    if (!secretQuestion) {
      setIsLoading(true);
      // submitClaim سنبنيه في Phase 4
      router.push(`/items/${itemId}/claim`);
      return;
    }
    // إذا كان هناك سؤال سري نفتح الـ Modal
    setShowModal(true);
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError("يرجى إدخال الإجابة");
      return;
    }
    setIsLoading(true);
    setError(null);
    // submitClaim سنبنيه في Phase 4 — هنا نضع placeholder
    console.log({ itemId, answer });
    setIsLoading(false);
    setShowModal(false);
  }

  return (
    <>
      <button onClick={handleClaim}
        className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800">
        أنا صاحب هذا الغرض
      </button>

      {/* Modal السؤال السري */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-2 text-lg font-bold">سؤال التحقق 🔐</h2>
            <p className="mb-4 text-sm text-gray-500">
              للتحقق من ملكيتك، يرجى الإجابة على السؤال التالي:
            </p>

            <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm font-medium text-amber-800">
              {secretQuestion}
            </div>

            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="إجابتك..."
              className="mb-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
            />

            {error && (
              <p className="mb-3 text-xs text-red-500">{error}</p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-gray-50">
                إلغاء
              </button>
              <button onClick={handleSubmitAnswer} disabled={isLoading}
                className="flex-2 flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50">
                {isLoading ? "جاري التحقق..." : "تحقق ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}