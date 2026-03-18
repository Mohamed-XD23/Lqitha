"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth.actions";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirm = formData.get("confirmPassword") as string;

    if (password !== confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await registerUser(formData);
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  return (
    <div className="bg-obsidian min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="24" height="34" viewBox="0 0 261.42 370" fill="none">
              <path
                d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z"
                fill="var(--color-gold)"
              />
              <path
                d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
                fill="var(--color-slate)"
              />
            </svg>
            <span className="font-cormorant text-3xl font-light tracking-[4px] text-ivory">
              LQITHA
            </span>
          </div>
          <p className="font-outfit text-[10px] tracking-[3px] uppercase text-slate">
            Lost · Found · Verified
          </p>
        </div>

        {/* Card */}
        <div className="bg-void border border-gold/18 rounded-xl p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
          
          <h1 className="font-cormorant text-3xl font-light text-ivory mb-8 text-center">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-slate block">
                Full Name
              </label>
              <input 
                name="name" 
                type="text" 
                required 
                className="w-full bg-obsidian border border-gold/18 rounded-lg px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all placeholder:text-slate/30"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-slate block">
                Email Address
              </label>
              <input 
                name="email" 
                type="email" 
                required 
                className="w-full bg-obsidian border border-gold/18 rounded-lg px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all placeholder:text-slate/30"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-slate block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full bg-obsidian border border-gold/18 rounded-lg px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate hover:text-gold transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-slate block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className={`w-full bg-obsidian border rounded-lg px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all pr-12 ${passwordError ? 'border-red-400/50' : 'border-gold/18'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate hover:text-gold transition-colors"
                >
                  <i className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                </button>
              </div>
              {passwordError && (
                <p className="font-outfit text-[11px] text-red-400 mt-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation text-[10px]" />
                  {passwordError}
                </p>
              )}
            </div>

            {error && (
              <p className="font-outfit text-xs text-red-400 py-3 px-4 bg-red-400/5 border border-red-400/20 rounded-lg">
                <i className="fa-solid fa-circle-exclamation mr-2" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-outfit text-[11px] font-bold tracking-[2px] uppercase py-4 rounded-full bg-gold text-void hover:bg-ivory transition-all shadow-lg shadow-gold/20 disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gold/10" />
            <span className="font-outfit text-[9px] tracking-[2px] uppercase text-slate/60">OR</span>
            <div className="flex-1 h-px bg-gold/10" />
          </div>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 font-outfit text-[10px] font-medium tracking-[2px] uppercase py-3.5 rounded-full bg-transparent text-ivory border border-gold/20 hover:bg-gold/5 transition-all"
          >
            <i className="fa-brands fa-google text-gold" />
            Continue with Google
          </button>

          <p className="font-outfit text-sm text-slate text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-gold hover:text-ivory transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
