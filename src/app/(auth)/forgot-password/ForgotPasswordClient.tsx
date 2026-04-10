"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth.actions";
import type { Dictionary } from "@/lib/dictionary.types";
import { Send, ArrowLeft, AtSign, Shield } from "lucide-react";

interface Props {
  dict: Dictionary;
}

export default function ForgotPasswordClient({ dict }: Props) {
  const t = dict.auth;
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-foreground-x-1/2 w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-110 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-primary/30"></div>
            <span className="font-interface text-xs font-bold tracking-sm uppercase text-primary">
              {dict.home.hero.badge}
            </span>
            <div className="h-px w-6 bg-primary/30"></div>
          </div>
          <h1 className="font-fraunces text-5xl font-light text-foreground leading-tight">
            LQITHA
          </h1>
        </div>

        <div className="bg-card border border-primary/15 rounded-sm p-10 shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-700 group-hover:scale-110">
                <Send className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h2 className="font-display text-3xl font-light text-foreground mb-4">
                {t.transmissionSuccess}
              </h2>
              <p className="font-interface text-sm text-muted-foreground leading-relaxed mb-10">
                {t.transmissionDesc}{" "}
                <span className="text-foreground font-medium">{email}</span>,{" "}
                {t.transmissionDesc2}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-interface text-[11px] font-bold tracking-xs uppercase text-primary hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3 h-3" strokeWidth={2.5} />
                {t.returnToLogin}
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="font-display text-3xl font-light text-foreground">
                  {t.recovery}
                </h2>
                <p className="font-interface text-[11px] text-muted-foreground mt-2 tracking-widest uppercase opacity-60">
                  {t.recoveryProtocol}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-xs font-bold tracking-[3px] uppercase text-muted-foreground font-interface">
                    {t.registeredEmail}
                  </label>
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="w-full bg-background border border-primary/20 rounded-xs px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary/60 transition-all font-interface"
                    />
                    <div className="absolute right-4 top-1/2 -translate-foreground-y-1/2 opacity-20 group-focus-within/input:opacity-60 transition-opacity">
                      <AtSign className="w-3.5 h-3.5 text-primary/40" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xs px-4 py-3">
                    <p className="text-[11px] font-interface text-red-400 leading-relaxed italic">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary py-5 rounded-xs text-background font-interface text-[11px] font-bold uppercase tracking-sm hover:bg-foreground transition-all shadow-xl shadow-primary/5 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {loading ? (
                    dict.common.loading
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      {t.initializeRecovery}
                      <Shield className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-10 border-t border-primary/5 text-center">
                <Link
                  href="/login"
                  className="font-interface text-xs font-bold tracking-xs uppercase text-muted-foreground hover:text-primary transition-colors"
                >
                  {t.returnToLogin}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
