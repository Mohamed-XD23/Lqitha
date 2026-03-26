"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/actions/auth.actions";
import type { Dictionary } from "@/lib/dictionary.types";
import { Eye, EyeOff, AlertTriangle, ShieldCheck, Key } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

interface Props {
  dict: Dictionary;
}

function ResetForm({ dict }: Props) {
  const t = dict.auth;
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError(t.passwordsNoMatch);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  if (!token) {
    return (
      <div className="bg-void border border-red-500/20 rounded-sm p-12 text-center shadow-2xl">
        <div className="w-22 h-22 rounded-full bg-red-500/5 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="font-display text-3xl text-ivory mb-4">
          {t.invalidToken}
        </h2>
        <p className="font-interface text-sm text-slate mb-8 leading-relaxed">
          {t.invalidTokenDesc}
        </p>
        <Link
          href="/forgot-password"
          className="font-interface text-xs font-bold tracking-[3px] uppercase text-gold hover:text-ivory transition-colors"
        >
          {t.requestRenewal}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-void border border-gold/15 rounded-sm p-10 shadow-2xl relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

      {success ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-[#30D158]/5 border border-[#30D158]/20 flex items-center justify-center mx-auto mb-10 transition-transform duration-1000 group-hover:scale-105">
            <ShieldCheck className="w-10 h-10 text-[#30D158] animate-pulse" />
          </div>
          <h2 className="font-display text-4xl font-light text-ivory mb-4">
            {t.passwordResetSuccess}
          </h2>
          <p className="font-interface text-sm text-slate leading-relaxed">
            {t.redirecting}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="font-display text-4xl font-light text-ivory">
              {t.finalStep}
            </h2>
            <p className="font-interface text-xs text-slate mt-2 tracking-widest uppercase opacity-60">
              {t.newCredentials}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold tracking-[3px] uppercase text-slate font-interface px-1">
                {t.newPassword}
              </label>
              <div className="relative group/input">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="••••••••"
                  className="w-full bg-obsidian border border-gold/20 rounded-xs pl-5 pr-14 py-4 text-sm text-ivory placeholder:text-slate/20 outline-none focus:border-gold/60 transition-all font-interface"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/40 hover:text-gold transition-colors p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold tracking-[3px] uppercase text-slate font-interface px-1">
                {t.confirmPassword}
              </label>
              <div className="relative group/input">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-obsidian border rounded-xs pl-5 pr-14 py-4 text-sm text-ivory placeholder:text-slate/20 outline-none transition-all font-interface ${
                    error === t.passwordsNoMatch
                      ? "border-red-500/40 focus:border-red-500/60"
                      : "border-gold/20 focus:border-gold/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate/40 hover:text-gold transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xs px-5 py-4">
                <p className="text-[12px] font-interface text-red-300 leading-relaxed italic uppercase tracking-px">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold py-5 rounded-xs text-obsidian font-interface text-xs font-bold uppercase tracking-sm hover:bg-ivory transition-all shadow-xl shadow-gold/5 disabled:opacity-50 disabled:cursor-not-allowed min-h-[58px]"
            >
              {loading ? (
                <div className="scale-[1.2] origin-center">
                  <ButtonLoader />
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  {t.commitChanges}
                  <Key className="w-3.5 h-3.5" strokeWidth={2.5} />
                </span>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordClient({ dict }: Props) {
  return (
    <div className="bg-obsidian min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-gold/30"></div>
            <span className="font-interface text-[10px] font-bold tracking-[5px] uppercase text-gold">
              {dict.auth.recoveryProtocol}
            </span>
            <div className="h-px w-8 bg-gold/30"></div>
          </div>
          <h1 className="font-fraunces text-5xl font-light text-ivory leading-tight">
            LQITHA
          </h1>
        </div>

        <Suspense
          fallback={
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
              <p className="font-interface text-[10px] uppercase tracking-[3px] text-slate">
                {dict.common.loading}
              </p>
            </div>
          }
        >
          <ResetForm dict={dict} />
        </Suspense>
      </div>
    </div>
  );
}
