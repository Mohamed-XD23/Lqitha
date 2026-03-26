import Link from "next/link";
import { getDictionary, getLocale } from "@/lib/dictionary";

export default async function Footer() {
  const fallbackDict = {
    nav: {
      browse: "Browse",
      reportItem: "Post Item",
      dashboard: "Dashboard",
    },
    home: {
      hero: {
        badge: "Lost · Found · Verified",
      },
    },
  };

  let locale: "en" | "ar" = "en";
  let dict = fallbackDict;

  try {
    locale = await getLocale();
  } catch (error) {
    console.error("Footer getLocale() failed:", error);
  }

  try {
    dict = await getDictionary();
  } catch (error) {
    console.error("Footer getDictionary() failed:", error);
  }

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <footer
      dir={dir}
      className="bg-obsidian border-t border-gold/15 px-6 py-12"
    >
      <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-8 text-center md:flex-row rtl:md:flex-row-reverse">
        <div className="flex items-center gap-3 rtl:flex-row-reverse">
          <svg
            width="20"
            height="28"
            viewBox="0 0 261.42 370"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z"
              fill="var(--color-gold)"
            />
            <path
              d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
              fill="var(--color-slate)"
            />
          </svg>
          <span className="font-display text-lg font-light tracking-sm text-ivory">
            LQITHA
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-8 rtl:flex-row-reverse">
          {[
            { href: "/browse", label: dict.nav.browse },
            { href: "/items/new", label: dict.nav.reportItem },
            { href: "/dashboard", label: dict.nav.dashboard },
            { href: "/terms", label: dict.auth.termsService },
            { href: "/privacy", label: dict.auth.privacyPolicy },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-interface text-[10px] font-medium tracking-xs uppercase text-slate hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="font-interface text-[10px] tracking-xs uppercase text-slate/60">
          © {new Date().getFullYear()} Lqitha · {dict.home.hero.badge}
        </p>
      </div>
    </footer>
  );
}
