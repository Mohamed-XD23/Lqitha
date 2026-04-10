"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  CheckCircle,
} from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";
import { Dictionary } from "@/lib/dictionary.types";

interface Props {
  dict: Dictionary;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className="border border-primary/15 rounded-sm overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between px-6 py-4 bg-card">
        <p className="font-outfit text-sm text-foreground font-medium pr-4">{q}</p>
        {open ? (
          <ChevronUp className="w-4 h-4 text-primary shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </div>
      {open && (
        <div className="px-6 py-4 bg-background border-t border-border">
          <p className="font-outfit text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportClient({ dict }: Props) {
  const t = dict.support;
  const [form, setForm] = useState({
    name: "",
    email: "",
    type: "question",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error("Failed to send support request.");
      }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-background border border-primary/18 rounded-xs px-4 py-3 font-outfit text-sm text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/70";
  const labelClass =
    "font-outfit text-xs font-medium tracking-[3px] uppercase text-muted-foreground block mb-2";

  return (
    <div className="bg-background min-h-full">
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <span className="font-outfit text-xs font-medium tracking-[4px] uppercase text-primary">
            {t.badge}
          </span>
          <h1 className="font-cormorant text-5xl font-light text-foreground mt-2 mb-3">
            {t.title}
          </h1>
          <p className="font-outfit text-sm text-muted-foreground max-w-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* LEFT — FAQ + Contact Info */}
          <div className="lg:col-span-3 space-y-10">
            {/* FAQ */}
            <div>
              <div className="mb-6">
                <h2 className="font-cormorant text-2xl font-400 text-foreground">
                  {t.faqTitle}
                </h2>
                <p className="font-outfit text-xs text-muted-foreground mt-1">
                  {t.faqSubtitle}
                </p>
              </div>
              <div className="space-y-2">
                {t.faq.map((item: { q: string; a: string }, i: number) => (
                  <FAQItem key={i} q={item.q} a={item.a} />
                ))}
              </div>
            </div>

            {/* Contact Info Cards */}
            <div>
              <h2 className="font-cormorant text-2xl font-400 text-foreground mb-4">
                {t.contactTitle}
              </h2>
              <div>
                <a
                  href={`mailto:${t.contactEmail}`}
                  className="flex items-start gap-3 p-4 bg-card border border-primary/15 rounded-sm hover:border-primary/30 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div >
                    <p className="font-outfit text-xs font-medium text-foreground">
                      {t.contactEmailLabel}
                    </p>
                    <p className="font-outfit text-sm text-muted-foreground mt-0.5">
                      {t.contactEmail}
                    </p>
                    <p className="font-outfit text-xs text-primary/60 mt-1">
                      {t.responseTime}
                    </p>
                  </div>
                </a>

                
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-primary/15 rounded-sm p-6 sticky top-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-[#7DC99A]" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-light text-foreground mb-3">
                    {t.successTitle}
                  </h3>
                  <p className="font-outfit text-xs text-muted-foreground leading-relaxed mb-6">
                    {t.successDesc}
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="font-outfit text-xs font-medium tracking-[3px] uppercase text-primary border border-primary/25 px-6 py-2.5 rounded-xs hover:bg-primary/5 transition-colors"
                  >
                    {t.sendAnother}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="font-cormorant text-xl font-400 text-foreground">
                      {t.feedbackTitle}
                    </h2>
                    <p className="font-outfit text-xs text-muted-foreground mt-1">
                      {t.feedbackSubtitle}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={labelClass}>{t.nameLabel}</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t.emailLabel}</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>{t.typeLabel}</label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          setForm({ ...form, type: e.target.value })
                        }
                        className={`${inputClass} cursor-pointer`}
                      >
                        {Object.entries(t.types).map(([k, v]) => (
                          <option
                            key={k}
                            value={k}
                            style={{ background: "#13131F",
                              color: "#f2efe8",
                              fontSize: "1rem",
                              gap: "0.75rem",
                             }}
                          >
                            {v as string}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>{t.messageLabel}</label>
                      <textarea
                        required
                        value={form.message}
                        rows={5}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className={`${inputClass} resize-none`}
                        placeholder={t.messagePlaceholder}
                      />
                    </div>

                    {error && (
                      <p className="font-outfit text-xs text-[#D48080] py-2 px-3 bg-[#D48080]/5 border border-[#D48080]/20 rounded-xs">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full font-outfit text-sm font-medium tracking-[3px] uppercase py-3.5 rounded-xs bg-primary text-background hover:bg-foreground transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-12"
                    >
                      {loading ? (
                        <ButtonLoader />
                      ) : (
                        <>
                          {t.submitButton}
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
