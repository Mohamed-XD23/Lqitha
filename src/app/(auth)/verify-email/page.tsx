import { verifyEmail } from "@/actions/auth.actions";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/dictionary.types";
import Link from "next/link";
import { CheckCircle, ShieldAlert, LogIn, RotateCcw } from "lucide-react";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const dict = await getDictionary();
  const t = dict.auth;
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyResult success={false} message={t.invalidTokenDesc} dict={dict} />
    );
  }

  const result = await verifyEmail(token);

  return (
    <VerifyResult
      success={!!result.success}
      message={result.error ?? t.identityConfirmed}
      dict={dict}
    />
  );
}

function VerifyResult({
  success,
  message,
  dict,
}: {
  success: boolean;
  message: string;
  dict: Dictionary;
}) {
  const t = dict.auth;

  return (
    <div className="bg-obsidian min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[440px] relative z-10 text-center">
        {/* Brand Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-6 bg-gold/30"></div>
            <span className="font-interface text-xs font-bold tracking-sm uppercase text-gold">
              {dict.home.hero.badge}
            </span>
            <div className="h-px w-6 bg-gold/30"></div>
          </div>
          <h1 className="font-fraunces text-5xl font-light text-ivory leading-tight">
            LQITHA
          </h1>
        </div>

        <div className="bg-void border border-gold/15 rounded-sm p-12 shadow-2xl relative group">
          <div className="absolute top-0 left-0 w-full h-[0.5px] bg-linear-to-r from-transparent via-gold/40 to-transparent" />

          <div className="mb-10 relative">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 border transition-all duration-1000 group-hover:scale-110 ${
                success
                  ? "bg-[#30D158]/5 border-[#30D158]/20"
                  : "bg-red-500/5 border-red-500/20"
              }`}
            >
              {success ? (
                <CheckCircle className="w-10 h-10 text-[#30D158]" />
              ) : (
                <ShieldAlert className="w-10 h-10 text-red-400" />
              )}
            </div>

            <h2 className="font-display text-4xl font-light text-ivory leading-tight">
              {success ? t.identityConfirmed : t.accessDenied}
            </h2>
            <p className="font-interface text-xs text-slate mt-2 tracking-widest uppercase opacity-60">
              {success ? t.protocolSuccess : t.securityInterception}
            </p>
          </div>

          <p className="font-interface text-sm text-slate leading-relaxed mb-12">
            {message}
          </p>

          <Link
            href={success ? "/login" : "/register"}
            className="block w-full bg-gold py-5 rounded-xs text-obsidian font-interface text-xs font-bold uppercase tracking-sm hover:bg-ivory transition-all shadow-xl shadow-gold/5 group/btn"
          >
            <span className="flex items-center justify-center gap-3">
              {success ? t.enterWorkspace : t.reInitiate}
              {success ? (
                <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              ) : (
                <RotateCcw className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              )}
            </span>
          </Link>
        </div>

        <p className="mt-12 text-[9px] text-slate font-interface tracking-[3px] uppercase opacity-30">
          {dict.home.hero.badge}
        </p>
      </div>
    </div>
  );
}
