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
    <header className="bg-obsidian border-b border-gold/15 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-50 group">
          <div className="transition-transform duration-500 group-hover:rotate-12">
            <svg width="28" height="40" viewBox="0 0 261.42 370" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M261.42,278v84c0,4.42-3.58,8-8,8H8c-4.42,0-8-3.58-8-8v-174.57l100-100v182.57h153.42c4.42,0,8,3.58,8,8Z" fill="var(--color-gold)"/>
              <path d="M100,.03L0,100.03V8C0,3.58,3.58,0,8,0h92v.03Z" fill="var(--color-slate)"/>
            </svg>
          </div>
          <span className="font-cormorant text-2xl font-light tracking-[4px] text-ivory group-hover:text-gold transition-colors">
            LQITHA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/browse"
            className="font-outfit text-[11px] font-medium tracking-[2px] uppercase text-slate hover:text-gold transition-all"
          >
            Browse
          </Link>

          {session?.user && (
            <>
              <Link
                href="/dashboard"
                className="font-outfit text-[11px] font-medium tracking-[2px] uppercase text-slate hover:text-gold transition-all"
              >
                Dashboard
              </Link>
              <Link
                href="/items/new"
                className="font-outfit text-[10px] font-bold tracking-[2px] uppercase bg-gold text-void px-6 py-2.5 rounded-full hover:bg-ivory transition-all shadow-lg shadow-gold/10"
              >
                Post Item
              </Link>
            </>
          )}

          {session?.user ? (
            <div className="flex items-center gap-6 border-l border-gold/10 pl-6 ml-2">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="flex justify-center items-center rounded-full w-8 h-8 bg-gold/10 border border-gold/20 text-gold group-hover:bg-gold group-hover:text-void transition-all">
                  <i className="fa-solid fa-user text-[10px]"></i>
                </div>
                <span className="text-[12px] font-outfit text-slate group-hover:text-ivory">{session?.user?.name}</span>
              </div>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="font-outfit text-[10px] font-medium tracking-[2px] uppercase text-slate border border-gold/20 px-5 py-2 rounded-full hover:border-gold hover:text-gold transition-all"
                >
                  Sign Out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link
                href="/login"
                className="font-outfit text-[11px] font-medium tracking-[2px] uppercase text-slate hover:text-gold transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="font-outfit text-[10px] font-bold tracking-[2px] uppercase bg-gold text-void px-6 py-2.5 rounded-full hover:bg-ivory transition-all shadow-lg shadow-gold/10"
              >
                Register
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Nav */}
        <MobileMenu>
          <div className="flex flex-col items-center gap-8 py-10">
            <Link
              href="/browse"
              className="font-outfit text-lg font-light tracking-[4px] uppercase text-ivory hover:text-gold transition-all"
            >
              Browse
            </Link>

            {session?.user && (
              <>
                <Link
                  href="/dashboard"
                  className="font-outfit text-lg font-light tracking-[4px] uppercase text-ivory hover:text-gold transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/items/new"
                  className="font-outfit text-sm font-bold tracking-[3px] uppercase bg-gold text-void px-10 py-4 rounded-full shadow-xl shadow-gold/20"
                >
                  Post Item
                </Link>
                
                <div className="w-full h-px bg-gold/10 my-4" />

                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center gap-3 text-ivory">
                    <div className="flex justify-center items-center rounded-full w-10 h-10 bg-gold/10 border border-gold/20 text-gold">
                      <i className="fa-solid fa-user text-sm"></i>
                    </div>
                    <span className="text-lg font-outfit">{session.user.name}</span>
                  </div>
                  
                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="font-outfit text-sm font-light tracking-[3px] uppercase text-slate border border-gold/20 px-8 py-3 rounded-full"
                    >
                      Sign Out
                    </button>
                  </form>
                </div>
              </>
            )}

            {!session?.user && (
              <div className="flex flex-col items-center gap-6">
                <Link
                  href="/login"
                  className="font-outfit text-lg font-light tracking-[4px] uppercase text-ivory hover:text-gold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="font-outfit text-sm font-bold tracking-[3px] uppercase bg-gold text-void px-10 py-4 rounded-full shadow-xl shadow-gold/20"
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