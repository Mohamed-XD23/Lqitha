"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  Github,
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
      className="border border-gold/15 rounded-sm overflow-hidden cursor-pointer hover:border-gold/30 transition-colors"
    >
      <div className="flex items-center justify-between px-6 py-4 bg-void">
        <p className="font-outfit text-sm text-ivory font-medium pr-4">{q}</p>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gold shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate shrink-0" />
        )}
      </div>
      {open && (
        <div className="px-6 py-4 bg-obsidian border-t border-gold/10">
          <p className="font-outfit text-sm text-slate leading-relaxed">{a}</p>
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
      // Send via mailto or API route
      await new Promise((res) => setTimeout(res, 1200)); // simulate
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full bg-obsidian border border-gold/18 rounded-xs px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all placeholder:text-slate/30";
  const labelClass =
    "font-outfit text-[10px] font-medium tracking-[3px] uppercase text-slate block mb-2";

  return (
    <div style={{ background: "#080810", minHeight: "100vh" }}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <span className="font-outfit text-[10px] font-medium tracking-[4px] uppercase text-gold">
            {t.badge}
          </span>
          <h1 className="font-cormorant text-5xl font-light text-ivory mt-2 mb-3">
            {t.title}
          </h1>
          <p className="font-outfit text-sm text-slate max-w-xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* LEFT — FAQ + Contact Info */}
          <div className="lg:col-span-3 space-y-10">
            {/* FAQ */}
            <div>
              <div className="mb-6">
                <h2 className="font-cormorant text-2xl font-400 text-ivory">
                  {t.faqTitle}
                </h2>
                <p className="font-outfit text-xs text-slate mt-1">
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
              <h2 className="font-cormorant text-2xl font-400 text-ivory mb-4">
                {t.contactTitle}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`mailto:${t.contactEmail}`}
                  className="flex items-start gap-3 p-4 bg-void border border-gold/15 rounded-sm hover:border-gold/30 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-sm bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-outfit text-xs font-medium text-ivory">
                      {t.contactEmailLabel}
                    </p>
                    <p className="font-outfit text-[10px] text-slate mt-0.5">
                      {t.contactEmail}
                    </p>
                    <p className="font-outfit text-[10px] text-gold/60 mt-1">
                      {t.responseTime}
                    </p>
                  </div>
                </a>

                
              </div>
            </div>
          </div>

          {/* RIGHT — Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-void border border-gold/15 rounded-sm p-6 sticky top-6">
              {sent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green/10 border border-green/20 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-[#7DC99A]" />
                  </div>
                  <h3 className="font-cormorant text-2xl font-light text-ivory mb-3">
                    {t.successTitle}
                  </h3>
                  <p className="font-outfit text-xs text-slate leading-relaxed mb-6">
                    {t.successDesc}
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="font-outfit text-[10px] font-medium tracking-[3px] uppercase text-gold border border-gold/25 px-6 py-2.5 rounded-xs hover:bg-gold/5 transition-colors"
                  >
                    {t.sendAnother}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="font-cormorant text-xl font-400 text-ivory">
                      {t.feedbackTitle}
                    </h2>
                    <p className="font-outfit text-[11px] text-slate mt-1">
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
                        placeholder="John Doe"
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
                            style={{ background: "#13131F" }}
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
                      className="w-full font-outfit text-[11px] font-medium tracking-[3px] uppercase py-3.5 rounded-xs bg-gold text-obsidian hover:bg-ivory transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-12"
                    >
                      {loading ? (
                        <ButtonLoader />
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          {t.submitButton}
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
