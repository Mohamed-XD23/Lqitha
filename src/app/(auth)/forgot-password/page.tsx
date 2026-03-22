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
    <div className="bg-[#080810] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A35A]/20 to-transparent" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#C4A35A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10">
        {/* Registration Mark */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-6 bg-[#C4A35A]/30"></div>
            <span className="font-outfit text-[10px] font-bold tracking-[4px] uppercase text-[#C4A35A]">
              Secure Access
            </span>
            <div className="h-px w-6 bg-[#C4A35A]/30"></div>
          </div>
          <h1 className="font-cormorant text-5xl font-light text-[#F2EFE8] leading-tight">
            Lqitha
          </h1>
          <p className="mt-4 text-[10px] text-[#7A7A8C] font-outfit tracking-[3px] uppercase opacity-60">
            Lost · Found · Verified
          </p>
        </div>

        <div className="bg-[#13131F] border border-[#C4A35A]/15 rounded-[4px] p-10 shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A35A]/30 to-transparent" />
          
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-[#C4A35A]/5 border border-[#C4A35A]/20 flex items-center justify-center mx-auto mb-8 transition-transform duration-700 group-hover:scale-110">
                <i className="fa-solid fa-paper-plane text-2xl text-[#C4A35A]" />
              </div>
              <h2 className="font-cormorant text-3xl font-light text-[#F2EFE8] mb-4">
                Transmission Success
              </h2>
              <p className="font-outfit text-sm text-[#7A7A8C] leading-relaxed mb-10">
                If an account exists for <span className="text-[#F2EFE8] font-medium">{email}</span>, a secure recovery link has been dispatched.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-outfit text-[11px] font-bold tracking-[2px] uppercase text-[#C4A35A] hover:text-[#F2EFE8] transition-colors"
              >
                <i className="fa-solid fa-arrow-left text-[9px]" />
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="font-cormorant text-3xl font-light text-[#F2EFE8]">
                  Recovery
                </h2>
                <p className="font-outfit text-[11px] text-[#7A7A8C] mt-2 tracking-widest uppercase opacity-60">
                  Password Reset Protocol
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold tracking-[3px] uppercase text-[#7A7A8C] font-outfit">
                    Registered Email
                  </label>
                  <div className="relative group/input">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g., identity@domain.com"
                      className="w-full bg-[#080810] border border-[#C4A35A]/20 rounded-[2px] px-5 py-4 text-sm text-[#F2EFE8] placeholder:text-[#7A7A8C]/20 outline-none focus:border-[#C4A35A]/60 transition-all font-outfit"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 group-focus-within/input:opacity-60 transition-opacity">
                      <i className="fa-solid fa-at text-[#C4A35A] text-xs" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-[2px] px-4 py-3">
                    <p className="text-[11px] font-outfit text-red-400 leading-relaxed italic">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#C4A35A] py-5 rounded-[2px] text-[#080810] font-outfit text-[11px] font-bold uppercase tracking-[4px] hover:bg-[#F2EFE8] transition-all shadow-xl shadow-[#C4A35A]/5 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
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

              <div className="mt-10 pt-10 border-t border-[#C4A35A]/5 text-center">
                <Link
                  href="/login"
                  className="font-outfit text-[10px] font-bold tracking-[2px] uppercase text-[#7A7A8C] hover:text-[#C4A35A] transition-colors"
                >
                  Remembered? <span className="ml-2 text-[#C4A35A]">Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}