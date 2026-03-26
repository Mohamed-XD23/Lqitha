"use client";

import React, { useTransition } from "react";
import { setLocale } from "@/actions/locale.actions";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LanguageSwitcher({ currentLocale }: { currentLocale: "en" | "ar" }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const toggleLanguage = () => {
    const newLocale = currentLocale === "en" ? "ar" : "en";
    const newDir = newLocale === "ar" ? "rtl" : "ltr";

    startTransition(async () => {
      await setLocale(newLocale);
      document.documentElement.lang = newLocale;
      document.documentElement.dir = newDir;
      document.body.setAttribute("dir", newDir);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggleLanguage}
      disabled={isPending}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 text-slate hover:text-gold hover:border-gold/50 transition-all ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label="Toggle language"
      title={currentLocale === "en" ? "تبديل إلى العربية" : "Switch to English"}
    >
      <Globe className="w-4 h-4" />
      <span className="font-interface text-xs font-medium uppercase tracking-widest mt-px">
        {currentLocale === "en" ? "AR" : "EN"}
      </span>
    </button>
  );
}
