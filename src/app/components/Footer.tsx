import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";

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
    privacy: {
      title: "Privacy Policy",
    },
    terms:{
      title: "Terms of Service",
    },
    support: {
      title: "Support",
    }
  };

  let dict = fallbackDict;

  try {
    dict = await getDictionary();
  } catch (error) {
    console.error("Footer getDictionary() failed:", error);
  }

  return (
    <footer
      className="bg-background border-t border-primary/15 px-6 py-12"
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
              fill="var(--color-primary)"
            />
            <path
              d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
              fill="var(--color-muted-foreground)"
            />
          </svg>
          <span className="font-fraunces text-lg font-light tracking-sm text-foreground">
            LQITHA
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-8 rtl:flex-row-reverse">
          {[
            { href: "/terms", label: dict.terms.title },
            { href: "/privacy", label: dict.privacy.title },
            { href: "/support", label: dict.support.title },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-interface text-xs font-medium tracking-xs uppercase text-muted-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="font-interface text-xs tracking-xs uppercase text-muted-foreground/60">
          © {new Date().getFullYear()} <span className="font-fraunces">LQITHA</span> · {dict.home.hero.badge}
        </p>
      </div>
    </footer>
  );
}
