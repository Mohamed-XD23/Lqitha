"use client";

import { useState } from "react";
import { submitClaim } from "@/actions/item.actions";
import Link from "next/link";

interface ClaimButtonProps {
  itemId: string;
  itemType: "LOST" | "FOUND"
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
        className="block w-full rounded-xl bg-black py-3 text-center text-sm font-semibold text-white hover:bg-gray-800"
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
      setError(response.error);
      setIsLoading(false);
      return;
    }

    // نعرض النتيجة داخل الـ Modal نفسه
    setResult({
      isCorrect: response.isCorrect!,
      status: response.status!,
      attemptsLeft: response.attemptsLeft!,
    });
    setIsLoading(false);
  }


  return (
    // TODO: استبدال الزر بـ "تم المطالبة به" إذا كان المستخدم قد أرسل طلباً مسبقاً
    // المنطق: جلب ClaimRequest الخاص بهذا المستخدم وهذا البلاغ من قاعدة البيانات
    // إذا وُجد → عرض حالته (PENDING / ACCEPTED / REJECTED) بدلاً من زر المطالبة
    <>
      <button
        onClick={() => secretQuestion ? setShowModal(true) : submitClaim(itemId, "")}
        className="w-full rounded-xl bg-black py-3 text-sm font-semibold text-white hover:bg-gray-800"
      >
        {itemType === "FOUND" ? "أنا صاحب هذا الغرض 🔑" : "أنا وجدت هذا الغرض 📦"}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* حالة النتيجة — تظهر بعد الإرسال */}
            {result ? (
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {result.isCorrect ? "✅" : "❌"}
                </div>
                <h2 className="text-lg font-bold mb-2">
                  {result.isCorrect ? "إجابة صحيحة!" : "إجابة خاطئة"}
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  {result.isCorrect
                    ? "تم إرسال طلبك إلى الشخص الذي وجد الغرض. سيتواصل معك قريباً."
                    : result.status === "REJECTED"
                      ? "لقد استنفدت جميع محاولاتك."
                      : `إجابة غير صحيحة. تبقّى لك ${result.attemptsLeft} محاولة.`}
                </p>
                <button
                  onClick={() => { setShowModal(false); setResult(null); setAnswer(""); }}
                  className="w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              /* حالة السؤال — تظهر قبل الإرسال */
              <>
                <h2 className="mb-2 text-lg font-bold">
                  {itemType === "FOUND" ? "أثبت أنك المالك 🔐" : "أثبت أنك وجدت الغرض 🔐"}
                </h2>

                <p className="mb-4 text-sm text-gray-500">
                  {itemType === "FOUND"
                    ? "أجب على السؤال التالي لإثبات أنك صاحب الغرض:"
                    : "أجب على السؤال التالي لإثبات أنك فعلاً تحمل الغرض:"}
                </p>

                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-800">
                  {secretQuestion}
                </div>

                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                  placeholder="إجابتك..."
                  className="mb-2 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
                />

                {error && <p className="mb-3 text-xs text-red-500">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowModal(false); setAnswer(""); setError(null); }}
                    className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {isLoading ? "جاري التحقق..." : "تحقق ✓"}
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