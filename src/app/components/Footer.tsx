import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-gold/15 px-6 py-12">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-3">
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

        {/* Links */}
        <nav className="flex items-center gap-8">
          {[
            { href: "/browse", label: "Browse" },
            { href: "/items/new", label: "Post Item" },
            { href: "/dashboard", label: "Dashboard" },
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

        {/* Copyright */}
        <p className="font-interface text-[10px] tracking-xs uppercase text-slate/60">
          © {new Date().getFullYear()} Lqitha — Lost · Found · Verified
        </p>
      </div>
    </footer>
  );
}
