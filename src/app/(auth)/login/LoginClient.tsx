"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ButtonLoader from "@/components/ui/ButtonLoader";
import type { Dictionary } from "@/lib/dictionary.types";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface Props {
  dict: Dictionary;
}

export default function LoginClient({ dict }: Props) {
  const t = dict.auth;
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
      setError(t.invalidCredentials);
      setLoading(false);
      return;
    }
    router.push("/browse");
    router.refresh();
  }

  return (
    <div className="bg-background min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-105">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="24" height="34" viewBox="0 0 261.42 370" fill="none">
              <path d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z" fill="#C4A35A"/>
              <path d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z" fill="#7A7A8C"/>
            </svg>
            <span className="font-fraunces text-3xl font-light tracking-sm text-foreground">LQITHA</span>
          </div>
          <p className="font-interface text-xs rtl:text-xs tracking-[3px] ltr:uppercase text-muted-foreground">
            {dict.home.hero.badge}
          </p>
        </div>

        <div className="bg-card border border-primary/18 rounded-sm p-10">
          <h1 className="font-display text-3xl font-light text-foreground mb-8 text-center">{t.signIn}</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="font-interface text-xs font-medium tracking-xs uppercase text-muted-foreground block">{t.emailAddress}</label>
              <input name="email" type="email" required
                className="w-full bg-sidebar-accent border border-primary/18 rounded-xs px-4 py-3 font-interface text-sm text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
                placeholder="email@example.com" />
            </div>

            <div className="space-y-2">
              <label className="font-interface text-xs font-medium tracking-xs uppercase text-muted-foreground block">{t.password}</label>
              <div className="relative">
                <input name="password" type={showPassword ? "text" : "password"} required
                  className="w-full bg-sidebar-accent border border-primary/18 rounded-xs px-4 py-3 font-interface text-sm text-foreground outline-none focus:border-primary/50 transition-all pr-12"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-foreground-y-1/2 bg-transparent border-none cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-interface text-xs text-[#D48080] py-3 px-4 bg-[#D48080]/5 border border-[#D48080]/20 rounded-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </p>
            )}

            <div className="text-right -mt-4">
              <Link href="/forgot-password" className="font-interface text-xs text-muted-foreground hover:text-primary transition-colors">
                {t.forgotPassword}
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="font-interface text-sm font-medium tracking-widest uppercase py-4 rounded-xs bg-primary text-background hover:bg-foreground transition-all disabled:opacity-50 mt-2 flex items-center justify-center min-h-14">
              {loading ? <ButtonLoader /> : t.signIn}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-primary/10" />
            <span className="font-interface text-xs tracking-xs uppercase text-muted-foreground/60">OR</span>
            <div className="flex-1 h-px bg-primary/10" />
          </div>

          <button onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl: "/" }); }}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 font-interface text-xs font-medium tracking-xs uppercase py-3.5 rounded-xs bg-transparent text-foreground border border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-50 min-h-12">
            {googleLoading ? <ButtonLoader /> : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {t.continueWithGoogle}
              </>
            )}
          </button>

          <p className="font-interface text-sm text-muted-foreground text-center mt-8">
            {t.noAccount}{" "}
            <Link href="/register" className="text-primary hover:text-foreground transition-colors font-medium">{t.createAccount}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
