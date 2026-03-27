"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { itemSchema, type ItemFormData } from "@/lib/validation/item.schema";
import { createItem } from "@/actions/item.actions";
import { formatDate } from "@/lib/utils/date";
import {
  Eye,
  EyeOff,
  Check,
  Search,
  Package,
  CheckCircle2,
  ChevronDown,
  ShieldHalf,
  Info,
  ArrowLeft,
  ArrowRight,
  Send,
  Heading,
  Tag,
  MapPin,
  CalendarDays,
  Phone,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import ImageUploader from "@/components/ui/ImageUploader";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { toast } from "sonner";
import Image from "next/image";

// مكوّن شريط التقدم
// مكوّن شريط التقدم
function StepIndicator({ current }: { current: number }) {
  const steps = ["Nature", "Details", "Security", "Review"];
  return (
    <div className="mb-14 flex items-center justify-between">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < current;
        const isCurrent = stepNum === current;
        return (
          <div key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-px text-[12px] font-bold transition-all duration-500 font-interface tracking-tighter
                ${
                  isCompleted
                    ? "bg-gold text-obsidian"
                    : isCurrent
                      ? "bg-void border border-gold text-gold shadow-[0_0_15px_rgba(196,163,90,0.15)]"
                      : "bg-void border border-gold/10 text-slate/40"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5" strokeWidth={4} />
                ) : (
                  `0${stepNum}`
                )}
              </div>
              <span
                className={`mt-3 text-md uppercase tracking-[3px] font-interface font-bold transition-colors ${
                  isCurrent ? "text-gold" : "text-slate/40"
                }`}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-4 mb-8 h-px flex-1 transition-all duration-700 ${
                  isCompleted ? "bg-gold" : "bg-gold/10"
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

  const values = getValues();
  values.date = new Date(values.date).toISOString();

  const result = await createItem(values);

  if ("error" in result) {
    toast.error(result.error);
    setIsSubmitting(false);
    return;
  }

  toast.success("Report published successfully ✓");
  router.push(`/items/${result.itemId}`);
}

  return (
    <div className="bg-obsidian min-h-screen">
      <div className="mx-auto max-w-xl px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-gold/40"></div>
            <span className="font-interface text-[10px] font-bold tracking-sm uppercase text-gold">
              Registry
            </span>
            <div className="h-px w-6 bg-gold/40"></div>
          </div>
          <h1 className="font-display text-5xl font-light text-ivory leading-tight mt-2">
            Create Report
          </h1>
          <p className="mt-6 text-xs text-slate font-interface tracking-[1.5px] max-w-xs mx-auto uppercase">
            Help us bridge the gap between lost and found
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-void border border-gold/15 rounded-sm p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

          {/* ===== STEP 1 ===== */}
          {step === 1 && (
            <div className="flex flex-col gap-8">
              <div>
                <label className="mb-4 block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Nature of Report
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {(["LOST", "FOUND"] as const).map((t) => (
                    <label
                      key={t}
                      className={`flex cursor-pointer flex-col items-center rounded-xs border p-6 transition-all duration-500 relative group
                      ${
                        watchedType === t
                          ? "border-gold bg-gold/5 shadow-xl shadow-gold/5"
                          : "border-gold/10 hover:border-gold/30 bg-transparent"
                      }`}
                    >
                      <input
                        type="radio"
                        value={t}
                        {...register("type")}
                        className="hidden"
                      />
                      <span
                        className={`text-2xl transition-all duration-500 group-hover:scale-110 ${watchedType === t ? "text-gold" : "text-slate/40"}`}
                      >
                        {t === "LOST" ? (
                          <Search className="w-6 h-6" strokeWidth={2} />
                        ) : (
                          <Package className="w-6 h-6" strokeWidth={2} />
                        )}
                      </span>
                      <span
                        className={`mt-3 font-semibold font-interface text-[11px] tracking-xs uppercase ${watchedType === t ? "text-ivory" : "text-slate"}`}
                      >
                        {t === "LOST" ? "Lost" : "Found"}
                      </span>
                      {watchedType === t && (
                        <div className="absolute top-2 right-2 text-md text-gold">
                          <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Identification Title
                </label>
                <input
                  {...register("title")}
                  placeholder="e.g., Black Leather Wallet"
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface shadow-sm"
                />
                {errors.title && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Category
                </label>
                <div className="relative">
                  <select
                    {...register("category")}
                    className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory outline-none focus:border-gold/50 transition-all appearance-none font-interface shadow-sm"
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
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gold/40">
                    <ChevronDown className="w-3 h-3" strokeWidth={3} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Detailed Description
                </label>
                <textarea
                  {...register("description")}
                  rows={4}
                  placeholder="Include defining features, marks, or brands..."
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface resize-none shadow-sm"
                />
                {errors.description && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===== STEP 2 ===== */}
          {step === 2 && (
            <div className="flex flex-col gap-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Physical Location
                </label>
                <input
                  {...register("location")}
                  placeholder="e.g., Algiers Center, Metro Station"
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface shadow-sm"
                />
                {errors.location && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Occurrence Date & Time
                </label>
                <input
                  {...register("date")}
                  type="datetime-local"
                  max={(() => {
                    const now = new Date();
                    const y = now.getFullYear();
                    const m = String(now.getMonth() + 1).padStart(2, "0");
                    const d = String(now.getDate()).padStart(2, "0");
                    const h = String(now.getHours()).padStart(2, "0");
                    const min = String(now.getMinutes()).padStart(2, "0");
                    return `${y}-${m}-${d}T${h}:${min}`;
                  })()}
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory outline-none focus:border-gold/50 transition-all font-interface scheme-dark shadow-sm"
                />
                {errors.date && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Contact Line
                  <span className="ml-3 text-md tracking-px lowercase text-gold/60 font-medium">
                    (Securely encrypted)
                  </span>
                </label>
                <input
                  {...register("phone")}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(
                      /\D/g,
                      "",
                    );
                  }}
                  placeholder="0XXXXXXXXX"
                  type="tel"
                  maxLength={10}
                  minLength={10}
                  inputMode="numeric"
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface shadow-sm"
                />
                {errors.phone && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Visual Documentation
                  <span className="ml-3 text-md tracking-px lowercase text-gold/40 font-medium">
                    (Recommended)
                  </span>
                </label>
                <div className="rounded-xs overflow-hidden border border-dashed border-gold/15 bg-obsidian/40 hover:border-gold/40 transition-all">
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
            <div className="flex flex-col gap-8">
              <div className="bg-obsidian border border-gold/15 rounded-xs p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-gold" />
                <div className="flex gap-5">
                  <div className="shrink-0 w-10 h-10 rounded-px bg-gold/10 flex items-center justify-center border border-gold/20">
                    <ShieldHalf className="w-4 h-4 text-gold" strokeWidth={2} />
                  </div>
                  <div className="space-y-3">
                    <p className="font-interface text-sm font-semibold text-ivory tracking-tight">
                      Security Protocol
                    </p>
                    <p className="text-[12px] text-slate leading-relaxed font-interface font-light">
                      {watchedType === "FOUND"
                        ? "Define a specific verification question. The claimant must answer this correctly before contact is permitted."
                        : "Define a question that helps others identify if they have found your specific item."}
                    </p>
                    <div className="pt-2">
                      <p className="text-[9px] text-gold/70 font-interface font-bold uppercase tracking-xs">
                        Example
                      </p>
                      <p className="text-[11px] text-slate/60 font-interface italic mt-1">
                        {watchedType === "FOUND"
                          ? '"What is the sticker on the back?" or "What is the unique scuff mark?"'
                          : '"What color is the charm attached?" or "What was the lock combination?"'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Verification Question
                </label>
                <input
                  {...register("secretQuestion")}
                  placeholder="e.g., What is the unique mark on the back?"
                  className="w-full bg-obsidian border border-gold/15 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface shadow-sm"
                />
                {errors.secretQuestion && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.secretQuestion.message}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-interface">
                  Verification Answer
                </label>
                <div className="relative">
                  <input
                    {...register("secretAnswer")}
                    type={showAnswer ? "text" : "password"}
                    placeholder="Correct answer for matching"
                    className="w-full bg-obsidian border border-gold/15 rounded-xs pl-5 pr-12 py-4 text-sm text-ivory placeholder:text-slate/30 outline-none focus:border-gold/50 transition-all font-interface shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/40 hover:text-gold transition-colors p-1"
                  >
                    {showAnswer ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.secretAnswer && (
                  <p className="mt-2 text-[9px] font-bold tracking-px text-red-400/80 uppercase font-interface">
                    {errors.secretAnswer.message}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ===== STEP 4 — REVIEW ===== */}
          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    label: "Report Nature",
                    icon:
                      watchedValues.type === "LOST" ? (
                        <Search
                          className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <Package
                          className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                          strokeWidth={2.5}
                        />
                      ),
                    value:
                      watchedValues.type === "LOST"
                        ? "Lost Report"
                        : "Found Report",
                  },
                  {
                    label: "Identification",
                    icon: (
                      <Heading
                        className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                        strokeWidth={2.5}
                      />
                    ),
                    value: watchedValues.title,
                  },
                  {
                    label: "Category",
                    icon: (
                      <Tag
                        className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                        strokeWidth={2.5}
                      />
                    ),
                    value: watchedValues.category,
                  },
                  {
                    label: "Location",
                    icon: (
                      <MapPin
                        className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                        strokeWidth={2.5}
                      />
                    ),
                    value: watchedValues.location,
                  },
                  {
                    label: "Timestamp",
                    icon: (
                      <CalendarDays
                        className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                        strokeWidth={2.5}
                      />
                    ),
                    value: formatDate(watchedValues.date),
                  },
                  {
                    label: "Contact Line",
                    icon: (
                      <Phone
                        className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                        strokeWidth={2.5}
                      />
                    ),
                    value: watchedValues.phone,
                  },
                  ...(watchedValues.secretQuestion
                    ? [
                        {
                          label: "Security Challenge",
                          icon: (
                            <ShieldHalf
                              className="w-3.5 h-3.5 text-gold/40 group-hover:text-gold transition-colors"
                              strokeWidth={2.5}
                            />
                          ),
                          value: watchedValues.secretQuestion,
                        },
                      ]
                    : []),
                ].map(({ label, icon, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center rounded-xs bg-obsidian/40 border border-gold/10 px-6 py-4 hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      {icon}
                      <span className="font-interface text-[9px] uppercase tracking-[3px] text-slate font-bold">
                        {label}
                      </span>
                    </div>
                    <span className="text-[13px] font-medium text-ivory font-interface">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gold/5 border border-gold/20 rounded-xs px-6 py-4 flex gap-4 items-center">
                <Info className="w-4 h-4 text-gold shrink-0" strokeWidth={2} />
                <p className="text-[10px] text-slate font-interface leading-relaxed uppercase tracking-px">
                  Note: Contact information remains encrypted until verification
                  is complete.
                </p>
              </div>

              {watchedValues.imageUrl && (
                <div className="overflow-hidden rounded-sm border border-gold/20 shadow-2xl relative">
                  <div className="absolute inset-0 bg-linear-to-t from-obsidian/60 to-transparent pointer-events-none" />
                  <Image
                    src={watchedValues.imageUrl}
                    alt="preview"
                    className="h-56 w-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* ===== Navigation Buttons ===== */}
        <div className="mt-14 flex items-center gap-6">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-10 py-5 rounded-xs border border-gold/30 text-gold font-interface text-[10px] font-bold uppercase tracking-sm hover:bg-gold/5 hover:border-gold transition-all flex items-center justify-center gap-3 group min-w-[140px]"
            >
              <ArrowLeft
                className="w-3 h-3 transition-transform group-hover:-translate-x-1"
                strokeWidth={2.5}
              />
              Back
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex-1 bg-gold px-10 py-5 rounded-xs text-obsidian font-interface text-[10px] font-bold uppercase tracking-sm hover:bg-ivory transition-all shadow-2xl shadow-gold/10 flex items-center justify-center gap-3 group"
            >
              Proceed
              <ArrowRight
                className="w-3 h-3 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gold px-10 py-5 rounded-xs text-obsidian font-interface text-[10px] font-bold uppercase tracking-sm hover:bg-ivory transition-all shadow-2xl shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[60px]"
            >
              {isSubmitting ? (
                <div className="scale-[1.2] origin-center">
                  <ButtonLoader />
                </div>
              ) : (
                <>
                  Authenticate & Publish
                  <Send className="w-3 h-3" strokeWidth={2.5} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
