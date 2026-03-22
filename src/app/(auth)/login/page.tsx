"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonLoader from "@/components/ui/ButtonLoader";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-[#080810] min-h-screen flex items-center justify-center p-6">
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
            <span className="font-cormorant text-3xl font-light tracking-[4px] text-[#F2EFE8]">
              LQITHA
            </span>
          </div>
          <p className="font-outfit text-[10px] tracking-[3px] uppercase text-[#7A7A8C]">
            Lost · Found · Verified
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#13131F] border border-[#C4A35A]/18 rounded-[4px] p-10 relative overflow-hidden">
          <h1 className="font-cormorant text-3xl font-light text-[#F2EFE8] mb-8 text-center">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-[#7A7A8C] block">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full bg-[#0F0F1A] border border-[#C4A35A]/18 rounded-[2px] px-4 py-3 font-outfit text-sm text-[#F2EFE8] outline-none focus:border-[#C4A35A]/50 transition-all placeholder:text-[#7A7A8C]/30"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-[#7A7A8C] block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-[#0F0F1A] border border-[#C4A35A]/18 rounded-[2px] px-4 py-3 font-outfit text-sm text-[#F2EFE8] outline-none focus:border-[#C4A35A]/50 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[#7A7A8C] hover:text-[#C4A35A] transition-colors"
                >
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <p className="font-outfit text-xs text-[#D48080] py-3 px-4 bg-[#D48080]/5 border border-[#D48080]/20 rounded-[2px]">
                <i className="fa-solid fa-circle-exclamation mr-2" />
                {error}
              </p>
            )}

            <div className="text-right -mt-4">
              <Link
                href="/forgot-password"
                className="font-outfit text-xs text-[#7A7A8C] hover:text-[#C4A35A] transition-colors no-underline block"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="font-outfit text-xs font-medium tracking-widest uppercase py-4 rounded-xs bg-[#C4A35A] text-[#080810] hover:bg-[#F2EFE8] transition-all disabled:opacity-50 mt-2 flex items-center justify-center min-h-[56px]"
            >
              {loading ? (
                <div className="scale-[1] origin-center">
                  <ButtonLoader />
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#C4A35A]/10" />
            <span className="font-outfit text-[9px] tracking-[2px] uppercase text-[#7A7A8C]/60">
              OR
            </span>
            <div className="flex-1 h-px bg-[#C4A35A]/10" />
          </div>

          {/* Google */}
          <button
            onClick={() => {
              setGoogleLoading(true);
              signIn("google", { callbackUrl: "/" });
            }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 font-outfit text-[10px] font-medium tracking-[2px] uppercase py-3.5 rounded-[2px] bg-transparent text-[#F2EFE8] border border-[#C4A35A]/20 hover:bg-[#C4A35A]/5 transition-all disabled:opacity-50 min-h-[48px]"
          >
            {googleLoading ? (
              <div className="scale-[1] origin-center">
                <ButtonLoader />
              </div>
            ) : (
              <>
                <i className="fa-brands fa-google text-[#C4A35A]" />
                Continue with Google
              </>
            )}
          </button>

          <p className="font-outfit text-sm text-[#7A7A8C] text-center mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-[#C4A35A] hover:text-[#F2EFE8] transition-colors font-medium"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
