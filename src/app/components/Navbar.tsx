import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import MobileMenu from "./MobileMenu";

export default async function Navbar() {
  const session = await auth();

  const handleSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <header className="bg-obsidian/90 border-b border-gold/15 px-6 py-4 sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-50 group">
          <div className="transition-transform duration-700 group-hover:rotate-12">
            <svg
              width="28"
              height="40"
              viewBox="0 0 261.42 370"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z"
                fill="#C4A35A"
              />
              <path
                d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z"
                fill="#7A7A8C"
              />
            </svg>
          </div>
          <span className="font-cormorant text-2xl font-light tracking-[5px] text-ivory group-hover:text-gold transition-colors">
            LQITHA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12">
          <Link
            href="/browse"
            className="font-outfit text-[11px] font-medium tracking-[3px] uppercase text-slate hover:text-gold transition-all"
          >
            Browse
          </Link>

          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="font-outfit text-[11px] font-medium tracking-[3px] uppercase text-slate hover:text-gold transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/items/new"
                className="font-outfit text-[10px] font-bold tracking-[3px] uppercase bg-gold text-obsidian px-8 py-3 rounded-xs hover:bg-ivory transition-all shadow-xl shadow-gold/10"
              >
                Post Item
              </Link>
            </>
          )}

          {session?.user ? (
            <div className="flex items-center gap-6">
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center gap-2 cursor-pointer font-outfit text-[10px] font-medium tracking-[3px] uppercase text-slate border border-gold/20 px-6 py-2.5 rounded-xs hover:border-gold hover:text-gold transition-all"
                >
                  Sign Out
                  <i className="fa-solid fa-right-from-bracket text-ivory/70 text-base ml-1"></i>
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-8">
              <Link
                href="/login"
                className="font-outfit text-[11px] font-medium tracking-[3px] uppercase text-slate hover:text-gold transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="font-outfit text-[10px] font-bold tracking-[3px] uppercase bg-gold text-obsidian px-8 py-3 rounded-xs hover:bg-ivory transition-all shadow-xl shadow-gold/10"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Nav */}
        <MobileMenu>
          <div className="flex flex-col items-center gap-10 py-10">
            <Link
              href="/browse"
              className="font-cormorant text-2xl font-light tracking-sm uppercase text-ivory hover:text-gold transition-all"
            >
              Browse
            </Link>

            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="font-cormorant text-2xl font-light tracking-sm uppercase text-ivory hover:text-gold transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/items/new"
                  className="font-outfit text-xs font-bold tracking-sm uppercase bg-gold text-obsidian px-12 py-5 rounded-xs shadow-2xl shadow-gold/20"
                >
                  Post Item
                </Link>

                <form action={handleSignOut}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 cursor-pointer font-outfit text-xs font-medium tracking-sm uppercase text-slate border border-gold/30 px-10 py-4 rounded-xs transition-all"
                  >
                    Sign out
                    <i className="fa-solid fa-right-from-bracket text-ivory/60 text-lg ml-2"></i>
                  </button>
                </form>
              </>
            )}

            {!session?.user && (
              <div className="flex flex-col items-center gap-10">
                <Link
                  href="/login"
                  className="font-cormorant text-2xl font-light tracking-sm uppercase text-ivory hover:text-gold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="font-outfit text-xs font-bold tracking-sm uppercase bg-gold text-obsidian px-12 py-5 rounded-xs shadow-2xl shadow-gold/20"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </MobileMenu>
      </div>
    </header>
  );
}
