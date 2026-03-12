"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { itemSchema, type ItemFormData } from "@/lib/validation/item.schema";
import { createItem } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import { Eye, EyeOff } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import ImageUploader from "@/components/ui/ImageUploader";
// مكوّن شريط التقدم
function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = ["معلومات الغرض", "المكان والتواصل", "سؤال التحقق", "المراجعة"];
  return (
    <div className="mb-8 flex items-center justify-between">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors
                ${isCompleted ? "bg-black text-white" : isCurrent ? "border-2 border-black text-black" : "border-2 border-gray-300 text-gray-400"}`}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={`mt-1 text-xs ${isCurrent ? "font-semibold text-black" : "text-gray-400"}`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 mb-4 h-px flex-1 ${isCompleted ? "bg-black" : "bg-gray-300"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NewItemPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const router = useRouter();

  // React Hook Form يحمل حالة كل الخطوات معاً
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      type: "LOST",
      title: "",
      category: "OTHER",
      description: "",
      location: "",
      date: "",
      phone: "",
      imageUrl: "",
      secretQuestion: "",
      secretAnswer: "",
    },
    mode: "onChange",
  });

  const {
    register,
    watch,
    trigger,
    getValues,
    control,
    formState: { errors },
  } = form;
  const watchedType = watch("type");
  const watchedValues = watch();

  // التحقق من صحة حقول الخطوة الحالية قبل الانتقال
  async function handleNext() {
    let fieldsToValidate: (keyof ItemFormData)[] = [];

    if (step === 1)
      fieldsToValidate = ["type", "title", "category", "description"];
    if (step === 2) fieldsToValidate = ["location", "date", "phone"];
    if (step === 3 && watchedType === "FOUND")
      fieldsToValidate = ["secretQuestion", "secretAnswer"];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) setStep((s) => s + 1);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    const result = await createItem(getValues());
    if (result.error) {
      alert(result.error);
      setIsSubmitting(false);
      return;
    }
    router.push(`/items/${result.itemId}`);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="mb-2 text-2xl font-bold">نشر بلاغ جديد</h1>
      <p className="mb-8 text-sm text-gray-500">
        أدخل تفاصيل الغرض لمساعدة الآخرين في إيجاده
      </p>

      <StepIndicator current={step} total={4} />

      {/* ===== STEP 1 ===== */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              نوع البلاغ
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["LOST", "FOUND"] as const).map((t) => (
                <label
                  key={t}
                  className={`flex cursor-pointer flex-col items-center rounded-xl border-2 p-4 transition-colors
                  ${watchedType === t ? "border-black bg-black text-white" : "border-gray-200 hover:border-gray-400"}`}
                >
                  <input
                    type="radio"
                    value={t}
                    {...register("type")}
                    className="hidden"
                  />
                  <span className="text-2xl">{t === "LOST" ? "🔍" : "📦"}</span>
                  <span className="mt-1 font-semibold">
                    {t === "LOST" ? "مفقود" : "موجود"}
                  </span>
                  <span className="mt-1 text-xs opacity-70">
                    {t === "LOST" ? "أبحث عن غرضي" : "وجدت غرضاً"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">العنوان</label>
            <input
              {...register("title")}
              placeholder="مثال: مفتاح سيارة تويوتا"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">الفئة</label>
            <select
              {...register("category")}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            >
              {[
                ["PHONE", "هاتف"],
                ["KEYS", "مفاتيح"],
                ["WALLET", "محفظة"],
                ["DOCUMENTS", "وثائق"],
                ["ELECTRONICS", "إلكترونيات"],
                ["OTHER", "أخرى"],
              ].map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">الوصف</label>
            <textarea
              {...register("description")}
              rows={3}
              placeholder="صف الغرض بالتفصيل..."
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== STEP 2 ===== */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-1 block text-sm font-semibold">المدينة</label>
            <input
              {...register("location")}
              placeholder="مثال: الجزائر العاصمة"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.location && (
              <p className="mt-1 text-xs text-red-500">
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              التاريخ والوقت
            </label>
            <input
              {...register("date")}
              type="datetime-local"
              // max يمنع اختيار أي وقت بعد اللحظة الحالية من واجهة المستخدم
              max={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              رقم الهاتف
              <span className="mr-2 text-xs font-normal text-gray-400">
                (لن يظهر للآخرين حتى يحدث تطابق)
              </span>
            </label>
            <input
              {...register("phone")}
              placeholder="05XXXXXXXX"
              type="tel"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              Item Image
              <span className="mr-2 text-xs font-normal text-gray-400">
                (اختياري)
              </span>
            </label>
            <Controller
              name="imageUrl"
              control={form.control}
              render={({ field }) => (
                <ImageUploader
                  endpoint="itemImage"
                  value={field.value ?? null}
                  onChange={field.onChange} // عند رفع صورة → يُحدّث RHF تلقائياً
                />
              )}
            />
          </div>
        </div>
      )}

      {/* ===== STEP 3 ===== */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div
            className={`rounded-xl border p-4 text-sm ${
              watchedType === "FOUND"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {watchedType === "FOUND" ? (
              <>
                🔐 <strong>أنت وجدت الغرض</strong> — ضع سؤالاً لا يعرف إجابته
                إلا المالك الحقيقي.
                <br />
                <span className="text-xs opacity-75 mt-1 block">
                  {
                    'مثال: "ما لون المحفظة من الداخل؟" أو "ماذا يوجد داخل الحقيبة؟"'
                  }
                </span>
              </>
            ) : (
              <>
                🔐 <strong>أنت فقدت الغرض</strong> — ضع سؤالاً يثبت أن من يجيب
                عليه فعلاً يحمل غرضك.
                <br />
                <span className="text-xs opacity-75 mt-1 block">
                  {
                    'مثال: "ما هي العلامة المميزة على المفتاح؟" أو "ما الذي كان في جيب الحقيبة الأمامية؟"'
                  }
                </span>
              </>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              السؤال السري
            </label>
            <input
              {...register("secretQuestion")}
              placeholder={
                watchedType === "FOUND"
                  ? "مثال: ما لون المحفظة من الداخل؟"
                  : "مثال: ما هي العلامة المميزة على الغرض؟"
              }
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
            {errors.secretQuestion && (
              <p className="mt-1 text-xs text-red-500">
                {errors.secretQuestion.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold">
              الإجابة السرية
            </label>
            {/* نضع الحقل والزر في div واحد لوضع الزر بداخل الحقل */}
            <div className="relative">
              <input
                {...register("secretAnswer")}
                type={showAnswer ? "text" : "password"}
                placeholder="الإجابة التي يعرفها صاحب الغرض فقط"
                className="w-full rounded-lg border px-3 py-2 pl-10 text-sm outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="button"
                onClick={() => setShowAnswer(!showAnswer)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.secretAnswer && (
              <p className="mt-1 text-xs text-red-500">
                {errors.secretAnswer.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ===== STEP 4 — REVIEW ===== */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          {[
            {
              label: "نوع البلاغ",
              value: watchedValues.type === "LOST" ? "🔍 مفقود" : "📦 موجود",
            },
            { label: "العنوان", value: watchedValues.title },
            { label: "الفئة", value: watchedValues.category },
            { label: "الوصف", value: watchedValues.description },
            { label: "المدينة", value: watchedValues.location },
            { label: "التاريخ والوقت", value: formatDate(watchedValues.date) },
            { label: "رقم الهاتف", value: watchedValues.phone }, // ← أغلقنا الـ object هنا
            ...(watchedValues.secretQuestion // ← نعرض السؤال لكلا النوعين إذا كان موجوداً
              ? [{ label: "السؤال السري", value: watchedValues.secretQuestion }]
              : []),
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between rounded-lg border px-4 py-3 text-sm"
            >
              <span className="font-semibold text-gray-600">{label}</span>
              <span className="text-gray-800">{value}</span>
            </div>
          ))}

          {/* ملاحظة خاصة برقم الهاتف — تظهر خارج الـ map */}
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
            <span>ℹ️</span>
            <span>
              رقم هاتفك لن يظهر للآخرين حتى يتم التحقق من ملكية الغرض بنجاح.
            </span>
          </div>
          {watchedValues.imageUrl && (
            <div className="overflow-hidden rounded-xl border">
              <img
                src={watchedValues.imageUrl}
                alt="preview"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* ===== Navigation Buttons ===== */}
      <div className="mt-8 flex gap-3">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex-1 rounded-lg border py-2.5 text-sm font-medium hover:bg-gray-50"
          >
            ← رجوع
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={handleNext}
            className="flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            التالي →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-black py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "جاري النشر..." : "نشر البلاغ ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
