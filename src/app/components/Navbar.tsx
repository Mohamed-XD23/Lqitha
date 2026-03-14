import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <header style={{ background: "#080810", borderBottom: "1px solid rgba(196,163,90,0.15)" }} className="px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <svg width="28" height="40" viewBox="0 0 261.42 370" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z" fill="#C4A35A"/>
            <path d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z" fill="#7A7A8C"/>
          </svg>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "24px",
            fontWeight: 300,
            letterSpacing: "4px",
            color: "#F2EFE8",
          }}>
            LQITHA
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-6">
          <Link
            href="/browse"
            style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#7A7A8C" }}
            className="hover:text-[#C4A35A] transition-colors"
          >
            Browse
          </Link>

          {session?.user && (
            <>
              <Link
                href="/dashboard"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#7A7A8C" }}
                className="hover:text-[#C4A35A] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/items/new"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", background: "#C4A35A", color: "#080810", padding: "10px 24px", borderRadius: "2px" }}
              >
                Post Item
              </Link>
            </>
          )}

          {session?.user ? (
            <div className="flex items-center gap-4">
              <span style={{ fontSize: "12px", color: "#7A7A8C" }}>{session.user.name}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#7A7A8C", border: "1px solid rgba(196,163,90,0.25)", padding: "9px 20px", borderRadius: "2px", background: "transparent" }}
                  className="hover:border-[#C4A35A] hover:text-[#C4A35A] transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 400, letterSpacing: "2px", textTransform: "uppercase", color: "#7A7A8C" }}
                className="hover:text-[#C4A35A] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "2px", textTransform: "uppercase", background: "#C4A35A", color: "#080810", padding: "10px 24px", borderRadius: "2px" }}
              >
                Register
              </Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}