"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/actions/auth.actions";

export default function ForgotPasswordPage() {
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
    <div className="bg-obsidian min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Registration Mark */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-gold/30"></div>
            <span className="font-outfit text-[10px] font-bold tracking-sm uppercase text-gold">
              Secure Access
            </span>
            <div className="h-px w-6 bg-gold/30"></div>
          </div>
          <h1 className="font-cormorant text-5xl font-light text-ivory leading-tight">
            Lqitha
          </h1>
          <p className="mt-4 text-[10px] text-slate font-outfit tracking-[3px] uppercase opacity-60">
            Lost · Found · Verified
          </p>
        </div>

        <div className="bg-void border border-gold/15 rounded-sm p-10 shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-gold/5 border border-gold/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-700 group-hover:scale-110">
                <i className="fa-solid fa-paper-plane text-2xl text-gold" />
              </div>
              <h2 className="font-cormorant text-3xl font-light text-ivory mb-4">
                Transmission Success
              </h2>
              <p className="font-outfit text-sm text-slate leading-relaxed mb-10">
                If an account exists for{" "}
                <span className="text-ivory font-medium">{email}</span>, a
                secure recovery link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-outfit text-[11px] font-bold tracking-xs uppercase text-gold hover:text-ivory transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-[9px]" />
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="font-cormorant text-3xl font-light text-ivory">
                  Recovery
                </h2>
                <p className="font-outfit text-[11px] text-slate mt-2 tracking-widest uppercase opacity-60">
                  Password Reset Protocol
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-[3px] uppercase text-slate font-outfit">
                    Registered Email
                  </label>
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g., identity@domain.com"
                      className="w-full bg-obsidian border border-gold/20 rounded-xs px-5 py-4 text-sm text-ivory placeholder:text-slate/20 outline-none focus:border-gold/60 transition-all font-outfit"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-60 transition-opacity">
                      <i className="fa-solid fa-at text-gold text-xs" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xs px-4 py-3">
                    <p className="text-[11px] font-outfit text-red-400 leading-relaxed italic">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gold py-5 rounded-xs text-obsidian font-outfit text-[11px] font-bold uppercase tracking-sm hover:bg-ivory transition-all shadow-xl shadow-gold/5 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      Initialize Recovery
                      <i className="fa-solid fa-shield-halved text-[10px] group-hover:rotate-12 transition-transform" />
                    </span>
                  )}
                </button>
              </form>

              <div className="mt-10 pt-10 border-t border-gold/5 text-center">
                <Link
                  href="/login"
                  className="font-outfit text-[10px] font-bold tracking-xs uppercase text-slate hover:text-gold transition-colors"
                >
                  Remembered? <span className="ml-2 text-gold">Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
