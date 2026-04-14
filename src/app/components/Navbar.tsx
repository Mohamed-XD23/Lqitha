import Link from "next/link";
import NextImage from "next/image";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import db from "@/lib/db";
import MobileMenu from "./MobileMenu";
import NotificationBell from "@/components/ui/NotificationBell";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import UserNavMenu from "@/components/ui/UserNavMenu";
import { getLocale, getDictionary } from "@/lib/dictionary";
import { handleSignOut } from "@/actions/auth.actions";
import { LogOut, LayoutDashboard, Settings } from "lucide-react";
import { Dictionary } from "@/lib/dictionary.types";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default async function Navbar() {
  let session: Session | null = null;
  let locale: "en" | "ar" = "en";
  let dict: Dictionary;

  try {
    session = await auth();
  } catch (error) {
    console.error("Navbar auth() failed:", error);
  }

  try {
    locale = await getLocale();
  } catch (error) {
    console.error("Navbar getLocale() failed:", error);
  }

  try {
    dict = await getDictionary();
  } catch (error) {
    console.error("Navbar getDictionary() failed:", error);
    // Fallback to en
    dict = await import("@/lib/dictionaries/en.json").then((m) => m.default);
  }

  // Fetch fresh user data if session exists to acard stale JWT data
  const dbUser = session?.user?.id
    ? await db.user
        .findUnique({
          where: { id: session.user.id },
          select: { name: true, image: true, email: true, emailVerified: true },
        })
        .catch((error) => {
          console.error("Navbar user lookup failed:", error);
          return null;
        })
    : null;

  const t = dict.nav;
  const user = dbUser || (session?.user ? { ...session.user } : null);
  const canUseSecureActions = session?.user
    ? dbUser
      ? Boolean(dbUser.emailVerified)
      : true
    : false;
  const showEmailVerificationAlert = Boolean(
    session?.user && dbUser && !dbUser.emailVerified,
  );
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <header className="bg-background/90 border-b border-primary/15 px-6 py-4 sticky top-0 z-50 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between rtl:flex-row-reverse">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 relative z-50 group rtl:flex-row-reverse"
        >
          <div className="transition-transform duration-700 group-hover:rotate-12 rtl:group-hover:-rotate-12">
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
          <span
            className="text-2xl font-light tracking-[4px] text-foreground group-hover:text-primary transition-colors"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            LQITHA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12 rtl:flex-row-reverse">
          <Link
            href="/browse"
            className="font-interface text-[11px] rtl:text-sm font-medium tracking-[3px] uppercase text-muted-foreground hover:text-primary transition-all"
          >
            {t.browse}
          </Link>

          {session?.user &&
            (canUseSecureActions ? (
              <Link
                href="/items/new"
                className="font-interface text-xs font-bold tracking-[3px] uppercase bg-primary text-background px-8 py-3 rounded-xs hover:bg-foreground transition-all shadow-xl shadow-primary/10"
              >
                {t.reportItem}
              </Link>
            ) : (
              <span className="font-interface text-xs font-bold tracking-[3px] uppercase border border-primary/25 text-primary/70 px-8 py-3 rounded-xs cursor-not-allowed">
                {t.verifyActionLabel}
              </span>
            ))}

          {session?.user && (
            <div className="flex items-center gap-6 rtl:flex-row-reverse">
              <ThemeSwitcher {...dict} />
              <LanguageSwitcher currentLocale={locale} dict={dict} />
              <NotificationBell userId={session.user.id!} dict={dict} />
              <UserNavMenu user={user ?? session.user} dict={dict} />
            </div>
          )}
          {!session?.user && (
            <div className="flex items-center gap-8 rtl:flex-row-reverse">
              <ThemeSwitcher {...dict} />
              <LanguageSwitcher currentLocale={locale} dict={dict} />
              <Link
                href="/login"
                className="font-interface text-[11px] font-medium tracking-[3px] uppercase text-muted-foreground hover:text-primary transition-all"
              >
                {t.signIn}
              </Link>
              <Link
                href="/register"
                className="font-interface text-xs font-bold tracking-[3px] uppercase bg-primary text-background px-8 py-3 rounded-xs hover:bg-foreground transition-all shadow-xl shadow-primary/10"
              >
                {t.register}
              </Link>
            </div>
          )}
        </nav>

        <div className="md:hidden flex items-center gap-3 rtl:flex-row-reverse">
          {session?.user && (
            <span className="text-xs text-muted-foreground uppercase tracking-widest">
              <NotificationBell userId={session.user.id!} dict={dict} />
            </span>
          )}

          {/* Mobile Nav */}
          <MobileMenu dir={dir} dict={dict}>
            <div className="flex flex-col items-center gap-10 py-10" dir={dir}>
              <Link
                href="/browse"
                className="font-display text-2xl font-light tracking-sm uppercase text-foreground hover:text-primary transition-all"
              >
                {t.browse}
              </Link>

              {session?.user && (
                <>
                  <div className="w-full max-w-70 mb-4 p-4 rounded-sm border border-border bg-card/30 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-3 w-full rtl:flex-row-reverse">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                        {user?.image ? (
                          <NextImage
                            src={user.image}
                            alt={t.user}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary font-display text-2xl">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 rtl:text-right">
                        <p className="font-interface text-sm font-semibold text-foreground truncate">
                          {user?.name}
                        </p>
                        <p className="font-interface text-xs text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mt-2">
                      <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 py-3 rounded-xs border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="font-interface text-xs uppercase tracking-widest">
                          {t.dashboard}
                        </span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center justify-center gap-2 py-3 rounded-xs border border-border text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="font-interface text-xs uppercase tracking-widest">
                          {t.settings}
                        </span>
                      </Link>
                    </div>
                  </div>

                  {canUseSecureActions ? (
                    <Link
                      href="/items/new"
                      className="font-interface text-xs font-bold tracking-sm uppercase bg-primary text-background px-12 py-5 rounded-xs shadow-2xl shadow-primary/20"
                    >
                      {t.reportItem}
                    </Link>
                  ) : (
                    <span className="font-interface text-xs font-bold tracking-sm uppercase border border-primary/25 text-primary/70 px-12 py-5 rounded-xs cursor-not-allowed">
                      {t.verifyActionLabel}
                    </span>
                  )}

                  <div className="flex items-center gap-6 mt-4 rtl:flex-row-reverse">
                    <div className="flex flex-row items-center gap-6 p-4 rounded-sm border border-primary/5 bg-primary/5 min-w-25">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          {t.theme}
                        </span>
                        <ThemeSwitcher {...dict} />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">
                          {t.language}
                        </span>
                        <LanguageSwitcher currentLocale={locale} dict={dict} />
                      </div>
                    </div>
                  </div>

                  <form action={handleSignOut}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 cursor-pointer font-interface text-xs font-medium tracking-sm uppercase text-red-400 border border-red-500/20 px-10 py-4 rounded-xs transition-all mt-4 rtl:flex-row-reverse"
                    >
                      {t.signOut}
                      <LogOut
                        className="w-5 h-5 ltr:ml-2 rtl:mr-2"
                        strokeWidth={2.5}
                      />
                    </button>
                  </form>
                </>
              )}

              {!session?.user && (
                <div className="flex flex-col items-center gap-10">
                  <ThemeSwitcher {...dict} />
                  <LanguageSwitcher currentLocale={locale} dict={dict} />
                  <Link
                    href="/login"
                    className="font-display text-2xl font-light tracking-sm uppercase text-foreground hover:text-primary transition-all"
                  >
                    {t.signIn}
                  </Link>
                  <Link
                    href="/register"
                    className="font-interface text-xs font-bold tracking-sm uppercase bg-primary text-background px-12 py-5 rounded-xs shadow-2xl shadow-primary/20"
                  >
                    {t.register}
                  </Link>
                </div>
              )}
            </div>
          </MobileMenu>
        </div>
      </div>
      {showEmailVerificationAlert && (
        <div className="mx-auto mt-3 max-w-6xl rounded-xs border border-amber-400/25 bg-amber-400/10 px-4 py-2.5">
          <p className="font-interface text-[11px] font-medium tracking-wide text-amber-100">
            {t.verifyAlertMsg}
          </p>
        </div>
      )}
    </header>
  );
}
