"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { resetPassword } from "@/actions/auth.actions";
import { Eye, EyeOff } from "lucide-react";
import ButtonLoader from "@/components/ui/ButtonLoader";

function ResetForm() {
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
      setError("Passwords do not match.");
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
      <div className="bg-[#13131F] border border-red-500/20 rounded-[4px] p-12 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/5 flex items-center justify-center mx-auto mb-8 border border-red-500/20">
          <i className="fa-solid fa-triangle-exclamation text-2xl text-red-400" />
        </div>
        <h2 className="font-cormorant text-2xl text-[#F2EFE8] mb-4">Invalid Access Token</h2>
        <p className="font-outfit text-[12px] text-[#7A7A8C] mb-8 leading-relaxed">
          This secure recovery link has expired or is mathematically incorrect. Please request a new transmission.
        </p>
        <Link
          href="/forgot-password"
          className="font-outfit text-[11px] font-bold tracking-[3px] uppercase text-[#C4A35A] hover:text-[#F2EFE8] transition-colors"
        >
          Request Renewal
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#13131F] border border-[#C4A35A]/15 rounded-[4px] p-10 shadow-2xl relative group overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A35A]/30 to-transparent" />
      
      {success ? (
        <div className="text-center py-6">
          <div className="w-20 h-20 rounded-full bg-[#30D158]/5 border border-[#30D158]/20 flex items-center justify-center mx-auto mb-10 transition-transform duration-1000 group-hover:scale-105">
            <i className="fa-solid fa-shield-check text-4xl text-[#30D158] animate-pulse" />
          </div>
          <h2 className="font-cormorant text-4xl font-light text-[#F2EFE8] mb-4">
            Identity Verified
          </h2>
          <p className="font-outfit text-sm text-[#7A7A8C] leading-relaxed">
            Password synchronized. Redirecting to the secure gateway in 3 seconds...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-12">
            <h2 className="font-cormorant text-4xl font-light text-[#F2EFE8]">
              Final Step
            </h2>
            <p className="font-outfit text-[11px] text-[#7A7A8C] mt-2 tracking-widest uppercase opacity-60">
              Establish New Credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-bold tracking-[3px] uppercase text-[#7A7A8C] font-outfit px-1">
                New Passphrase
              </label>
              <div className="relative group/input">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#080810] border border-[#C4A35A]/20 rounded-[2px] pl-5 pr-14 py-4 text-sm text-[#F2EFE8] placeholder:text-[#7A7A8C]/20 outline-none focus:border-[#C4A35A]/60 transition-all font-outfit"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7A8C]/40 hover:text-[#C4A35A] transition-colors p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[10px] font-bold tracking-[3px] uppercase text-[#7A7A8C] font-outfit px-1">
                Confirm Passphrase
              </label>
              <div className="relative group/input">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Repeat new passphrase"
                  className={`w-full bg-[#080810] border rounded-[2px] pl-5 pr-14 py-4 text-sm text-[#F2EFE8] placeholder:text-[#7A7A8C]/20 outline-none transition-all font-outfit ${
                    error?.includes("match")
                      ? "border-red-500/40 focus:border-red-500/60"
                      : "border-[#C4A35A]/20 focus:border-[#C4A35A]/60"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#7A7A8C]/40 hover:text-[#C4A35A] transition-colors p-1"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-[2px] px-5 py-4">
                <p className="text-[12px] font-outfit text-red-300 leading-relaxed italic uppercase tracking-[1px]">
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C4A35A] py-5 rounded-[2px] text-[#080810] font-outfit text-[11px] font-bold uppercase tracking-[4px] hover:bg-[#F2EFE8] transition-all shadow-xl shadow-[#C4A35A]/5 disabled:opacity-50 disabled:cursor-not-allowed min-h-[58px]"
            >
              {loading ? (
                <div className="scale-[1.2] origin-center">
                  <ButtonLoader />
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  Commit Changes
                  <i className="fa-solid fa-key-skeleton text-[10px]" />
                </span>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-[#080810] min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#C4A35A]/20 to-transparent" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#C4A35A]/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[460px] relative z-10">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="h-px w-8 bg-[#C4A35A]/30"></div>
            <span className="font-outfit text-[10px] font-bold tracking-[5px] uppercase text-[#C4A35A]">
              Security Matrix
            </span>
            <div className="h-px w-8 bg-[#C4A35A]/30"></div>
          </div>
          <h1 className="font-cormorant text-5xl font-light text-[#F2EFE8] leading-tight">
            Lqitha
          </h1>
        </div>

        <Suspense fallback={
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-2 border-[#C4A35A]/20 border-t-[#C4A35A] rounded-full animate-spin" />
            <p className="font-outfit text-[10px] uppercase tracking-[3px] text-[#7A7A8C]">Secure Boot...</p>
          </div>
        }>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}