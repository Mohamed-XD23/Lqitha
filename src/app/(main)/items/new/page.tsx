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
import { toast } from "sonner";
// مكوّن شريط التقدم
// مكوّن شريط التقدم
function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = ["Item Info", "Location & Contact", "Verification", "Review"];
  return (
    <div className="mb-10 flex items-center justify-between">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-medium transition-all duration-300 font-outfit
                ${
                  isCompleted
                    ? "bg-gold text-void shadow-[0_0_15px_rgba(196,163,90,0.3)]"
                    : isCurrent
                      ? "bg-void border-2 border-gold text-gold ring-4 ring-gold/10"
                      : "bg-void border-2 border-gold/20 text-slate"
                }`}
              >
                {isCompleted ? <i className="fa-solid fa-check"></i> : stepNum}
              </div>
              <span
                className={`mt-2 text-[10px] uppercase tracking-wider font-outfit font-medium transition-colors ${
                  isCurrent ? "text-gold" : "text-slate"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 mb-6 h-[1px] flex-1 transition-all duration-500 ${
                  isCompleted ? "bg-gold shadow-[0_0_10px_rgba(196,163,90,0.2)]" : "bg-gold/15"
                }`}
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
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }
    toast.success("Report published successfully ✓");
    router.push(`/items/${result.itemId}`);
  }

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-outfit text-[10px] font-medium tracking-[4px] uppercase text-gold">
            New Listing
          </span>
          <h1 className="font-cormorant text-4xl font-light text-ivory leading-none mt-2">
            Post a New Report
          </h1>
          <p className="mt-4 text-sm text-slate font-outfit max-w-xs mx-auto">
            Enter item details to help others find and recover it
          </p>
        </div>

        <StepIndicator current={step} total={4} />

        <div className="bg-void border-2 border-gold/18 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
          
          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <label className="mb-3 block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                Report Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["LOST", "FOUND"] as const).map((t) => (
                    <label
                      key={t}
                      className={`flex cursor-pointer flex-col items-center rounded-xl border-2 p-5 transition-all duration-300 relative group
                      ${
                        watchedType === t
                          ? "border-gold bg-gold/5 shadow-[0_0_20px_rgba(196,163,90,0.1)]"
                          : "border-gold/10 hover:border-gold/30 bg-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        value={t}
                        {...register("type")}
                        className="hidden"
                      />
                      <span className={`text-2xl transition-transform duration-300 group-hover:scale-110 ${watchedType === t ? "text-gold" : "text-slate"}`}>
                        {t === "LOST" ? (
                          <i className="fa-solid fa-magnifying-glass" />
                        ) : (
                          <i className="fa-solid fa-box" />
                        )}
                      </span>
                      <span className={`mt-2 font-medium font-outfit text-sm ${watchedType === t ? "text-ivory" : "text-slate"}`}>
                        {t === "LOST" ? "Lost" : "Found"}
                      </span>
                      <span className="mt-1 text-[10px] opacity-60 text-slate">
                        {t === "LOST" ? "Searching for item" : "Found an item"}
                      </span>
                      {watchedType === t && (
                        <div className="absolute top-2 right-2 text-[10px] text-gold animate-pulse">
                          <i className="fa-solid fa-circle-check" />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">Title</label>
                <input
                  {...register("title")}
                  placeholder="e.g., Toyota car key"
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit"
                />
                {errors.title && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">Category</label>
                <div className="relative">
                  <select
                    {...register("category")}
                    className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all appearance-none font-outfit"
                  >
                    {[
                      ["PHONE", "Phone"],
                      ["KEYS", "Keys"],
                      ["WALLET", "Wallet"],
                      ["DOCUMENTS", "Documents"],
                      ["ELECTRONICS", "Electronics"],
                      ["OTHER", "Other"],
                    ].map(([v, l]) => (
                      <option key={v} value={v} className="bg-void">
                        {l}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gold/50">
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">Description</label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Describe the item in detail to help us match the report..."
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit resize-none"
                />
                {errors.description && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">City/Location</label>
                <input
                  {...register("location")}
                  placeholder="e.g., Algiers, Center"
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit"
                />
                {errors.location && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                  Date and Time
                </label>
                <input
                  {...register("date")}
                  type="datetime-local"
                  max={new Date().toISOString().slice(0, 16)}
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit [color-scheme:dark]"
                />
                {errors.date && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                  Phone Number
                  <span className="ml-2 text-[9px] lowercase text-gold/60 font-medium">
                    (Private until ownership is verified)
                  </span>
                </label>
                <input
                  {...register("phone")}
                  placeholder="0XXXXXXXXX"
                  type="tel"
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit"
                />
                {errors.phone && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                  Item Image
                  <span className="ml-2 text-[9px] lowercase text-gold/60 font-medium font-outfit">
                    (OPTIONAL)
                  </span>
                </label>
                <div className="rounded-xl overflow-hidden border-2 border-dashed border-gold/15 bg-obsidian/40 hover:border-gold/30 transition-all">
                  <Controller
                    name="imageUrl"
                    control={form.control}
                    render={({ field }) => (
                      <ImageUploader
                        value={field.value ?? undefined}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 3 ===== */}
          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div className="bg-obsidian border border-gold/20 rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <i className="fa-solid fa-shield-halved text-gold text-sm" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-outfit text-[13px] font-medium text-ivory">Secure Verification</p>
                    <p className="text-[11px] text-slate leading-relaxed font-outfit">
                      {watchedType === "FOUND" 
                        ? "Set a question that only the true owner knows the answer to. They must answer it before contacting you."
                        : "Set a question that proves the person answering actually has your lost item."}
                    </p>
                    <p className="text-[10px] text-gold/70 font-outfit italic">
                      {watchedType === "FOUND"
                        ? 'e.g., "What color is the wallet inside?" or "What is in the small pocket?"'
                        : 'e.g., "What is the unique mark on the key?" or "What was inside the bag?"'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                  Secret Question
                </label>
                <input
                  {...register("secretQuestion")}
                  placeholder={
                    watchedType === "FOUND"
                      ? "e.g., What is the unique mark?"
                      : "e.g., What was inside the item?"
                  }
                  className="w-full bg-obsidian border border-gold/20 rounded-lg px-4 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit"
                />
                {errors.secretQuestion && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.secretQuestion.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium tracking-widest uppercase text-slate font-outfit">
                  Secret Answer
                </label>
                <div className="relative">
                  <input
                    {...register("secretAnswer")}
                    type={showAnswer ? "text" : "password"}
                    placeholder="Correct answer used to verify claimants"
                    className="w-full bg-obsidian border border-gold/20 rounded-lg px-10 py-3 text-sm text-ivory placeholder:text-slate/50 outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-outfit"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate hover:text-gold transition-colors"
                  >
                    {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gold/30">
                    <i className="fa-solid fa-lock text-[10px]" />
                  </div>
                </div>
                {errors.secretAnswer && (
                  <p className="mt-1 text-[10px] text-red-400 font-outfit">
                    {errors.secretAnswer.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===== STEP 4 — REVIEW ===== */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    label: "Report Type",
                    icon: watchedValues.type === "LOST" ? "fa-magnifying-glass" : "fa-box",
                    value: watchedValues.type === "LOST" ? "Lost" : "Found",
                  },
                  { label: "Title", icon: "fa-heading", value: watchedValues.title },
                  { label: "Category", icon: "fa-tag", value: watchedValues.category },
                  { label: "Location", icon: "fa-location-dot", value: watchedValues.location },
                  { label: "Date", icon: "fa-calendar-days", value: formatDate(watchedValues.date) },
                  { label: "Phone", icon: "fa-phone", value: watchedValues.phone },
                  ...(watchedValues.secretQuestion
                    ? [{ label: "Verification Question", icon: "fa-shield-halved", value: watchedValues.secretQuestion }]
                    : []),
                ].map(({ label, icon, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center rounded-xl bg-obsidian/40 border border-gold/10 px-5 py-3 hover:border-gold/25 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <i className={`fa-solid ${icon} text-[10px] text-gold/60 group-hover:text-gold transition-colors`} />
                      <span className="font-outfit text-[11px] uppercase tracking-wider text-slate">{label}</span>
                    </div>
                    <span className="text-[13px] font-medium text-ivory">{value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gold/5 border border-gold/20 rounded-lg px-4 py-3 flex gap-3 items-center">
                <i className="fa-solid fa-circle-info text-gold text-sm" />
                <p className="text-[10px] text-slate font-outfit leading-normal">
                  Your phone number will not be visible to others until the ownership of the item is successfully verified.
                </p>
              </div>

              {watchedValues.imageUrl && (
                <div className="overflow-hidden rounded-xl border-2 border-gold/20 shadow-lg">
                  <img
                    src={watchedValues.imageUrl}
                    alt="preview"
                    className="h-48 w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Navigation Buttons ===== */}
        <div className="mt-10 flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-8 py-3.5 rounded-full border border-gold/20 text-gold font-outfit text-[11px] uppercase tracking-widest font-bold hover:bg-gold/5 transition-all flex items-center gap-2 group"
            >
              <i className="fa-solid fa-arrow-right text-[10px] transition-transform group-hover:translate-x-1" />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-gold px-8 py-3.5 rounded-full text-void font-outfit text-[11px] uppercase tracking-widest font-bold hover:bg-ivory transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 group"
            >
              Next
              <i className="fa-solid fa-arrow-left text-[10px] transition-transform group-hover:-translate-x-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gold px-8 py-3.5 rounded-full text-void font-outfit text-[11px] uppercase tracking-widest font-bold hover:bg-ivory transition-all shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Report
                  <i className="fa-solid fa-paper-plane text-[10px]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
