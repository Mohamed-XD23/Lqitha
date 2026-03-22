"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/actions/auth.actions";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
                fill="#C4A35A"
              />
              <path
                d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
                fill="#7A7A8C"
              />
            </svg>
            <span className="font-cormorant text-3xl font-light tracking-sm text-ivory">
              LQITHA
            </span>
          </div>
          <p className="font-outfit text-[10px] tracking-[3px] uppercase text-slate">
            Lost · Found · Verified
          </p>
        </div>

        {/* Card */}
        <div className="bg-void border border-gold/18 rounded-sm p-10 relative overflow-hidden">
          <h1 className="font-cormorant text-3xl font-light text-ivory mb-8 text-center">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-xs uppercase text-slate block">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="w-full bg-[#0F0F1A] border border-gold/18 rounded-xs px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all placeholder:text-slate/30"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-xs uppercase text-slate block">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#0F0F1A] border border-gold/18 rounded-xs px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all placeholder:text-slate/30"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-xs uppercase text-slate block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  className="w-full bg-[#0F0F1A] border border-gold/18 rounded-xs px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate hover:text-gold transition-colors"
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-xs uppercase text-slate block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  required
                  className={`w-full bg-[#0F0F1A] border rounded-xs px-4 py-3 font-outfit text-sm text-ivory outline-none focus:border-gold/50 transition-all pr-12 ${passwordError ? "border-red-400/50" : "border-gold/18"}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-slate hover:text-gold transition-colors"
                >
                  <i
                    className={`fa-solid ${showConfirm ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
              {passwordError && (
                <p className="font-outfit text-[11px] text-[#D48080] mt-1.5 flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-exclamation text-[10px]" />
                  {passwordError}
                </p>
              )}
            </div>

            {error && (
              <p className="font-outfit text-xs text-[#D48080] py-3 px-4 bg-[#D48080]/5 border border-[#D48080]/20 rounded-xs">
                <i className="fa-solid fa-circle-exclamation mr-2" />
                {error}
              </p>
            )}

            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <input
                type="checkbox"
                id="terms"
                required
                style={{
                  marginTop: "3px",
                  accentColor: "#C4A35A",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="terms"
                style={{
                  fontFamily: "var(--font-outfit)",
                  fontSize: "11px",
                  color: "#7A7A8C",
                  lineHeight: 1.6,
                  cursor: "pointer",
                }}
              >
                {"I agree to the "}
                <Link
                  href="/terms"
                  style={{ color: "#C4A35A", textDecoration: "none" }}
                >
                  Terms of Service
                </Link>
                {" and "}
                <Link
                  href="/privacy"
                  style={{ color: "#C4A35A", textDecoration: "none" }}
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-outfit text-[11px] font-medium tracking-xs uppercase py-4 rounded-xs bg-gold text-obsidian hover:bg-ivory transition-all disabled:opacity-50 mt-2 flex items-center justify-center min-h-[56px]"
            >
              {loading ? (
                <div className="scale-[1] origin-center">
                  <ButtonLoader />
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gold/10" />
            <span className="font-outfit text-[9px] tracking-xs uppercase text-slate/60">
              OR
            </span>
            <div className="flex-1 h-px bg-gold/10" />
          </div>

          {/* Google */}
          <button
            onClick={() => {
              setGoogleLoading(true);
              signIn("google", { callbackUrl: "/" });
            }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 font-outfit text-[10px] font-medium tracking-xs uppercase py-3.5 rounded-xs bg-transparent text-ivory border border-gold/20 hover:bg-gold/5 transition-all disabled:opacity-50 min-h-[48px]"
          >
            {googleLoading ? (
              <div className="scale-[1] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>
                <i className="fa-brands fa-google text-gold" />
                Continue with Google
              </>
            )}
          </button>

          <p className="font-outfit text-sm text-slate text-center mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-gold hover:text-ivory transition-colors font-medium"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
