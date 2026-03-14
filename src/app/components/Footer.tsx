import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#080810", borderTop: "1px solid rgba(196,163,90,0.15)" }} className="px-6 py-10">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <svg width="20" height="28" viewBox="0 0 261.42 370" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z" fill="#C4A35A"/>
            <path d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z" fill="#7A7A8C"/>
          </svg>
          <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "18px", fontWeight: 300, letterSpacing: "4px", color: "#F2EFE8" }}>
            LQITHA
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-6">
          {[
            { href: "/browse", label: "Browse" },
            { href: "/items/new", label: "Post Item" },
            { href: "/dashboard", label: "Dashboard" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "11px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase" as const, color: "#7A7A8C" }}
              className="hover:text-[#C4A35A] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <p style={{ fontFamily: "var(--font-outfit), sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase" as const, color: "#7A7A8C" }}>
          © {new Date().getFullYear()} Lqitha — Lost · Found · Verified
        </p>

      </div>
    </footer>
  );
}