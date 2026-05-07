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
    dict = await getDictionary(locale);
  } catch (error) {
    console.error("Navbar getDictionary(locale) failed:", error);
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
  const mobileActionBaseClass =
    "flex w-full items-center justify-center gap-2 rounded-xs px-4 py-4 text-sm uppercase transition-all";
  const mobileNavLinkClass = `${mobileActionBaseClass} border border-border bg-card/20 font-display text-lg font-light tracking-[0.2em] text-foreground hover:border-primary/30 hover:text-primary`;
  const mobileSecondaryActionClass = `${mobileActionBaseClass} border border-border bg-card/30 font-interface font-medium tracking-[0.24em] text-muted-foreground hover:border-primary/25 hover:bg-primary/5 hover:text-primary`;
  const mobilePrimaryActionClass = `${mobileActionBaseClass} bg-primary font-interface font-bold tracking-[0.24em] text-background shadow-xl shadow-primary/15 hover:bg-foreground`;
  const mobileDisabledActionClass = `${mobileActionBaseClass} cursor-not-allowed border border-primary/25 font-interface font-bold tracking-[0.24em] text-primary/70`;
  const mobileSectionCardClass =
    "w-full rounded-sm border border-border bg-card/40 p-4 sm:p-5";

  return (
    <header className="sticky top-0 z-50 border-b border-primary/15 bg-background/90 px-4 py-3 backdrop-blur-xl sm:px-5 lg:px-6 lg:py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 sm:gap-4 rtl:flex-row-reverse">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-50 flex min-w-0 items-center gap-2.5 group rtl:flex-row-reverse sm:gap-3"
        >
          <div className="shrink-0 transition-transform duration-700 group-hover:rotate-12 rtl:group-hover:-rotate-12">
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
            className="whitespace-nowrap text-sm font-light tracking-[0.24em] text-foreground transition-colors group-hover:text-primary sm:text-lg sm:tracking-[0.32em] lg:text-xl lg:tracking-[0.36em] xl:text-2xl xl:tracking-[0.4em]"
            style={{ fontFamily: "var(--font-fraunces), serif" }}
          >
            LQITHA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 rtl:flex-row-reverse md:flex lg:gap-8 xl:gap-12">
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
                className="rounded-xs bg-primary px-6 py-3 font-interface text-xs font-bold uppercase tracking-[3px] text-background shadow-xl shadow-primary/10 transition-all hover:bg-foreground xl:px-8"
              >
                {t.reportItem}
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-xs border border-primary/25 px-6 py-3 font-interface text-xs font-bold uppercase tracking-[3px] text-primary/70 xl:px-8">
                {t.verifyActionLabel}
              </span>
            ))}

          {session?.user && (
            <div className="flex items-center gap-4 rtl:flex-row-reverse xl:gap-6">
              <ThemeSwitcher {...dict} />
              <LanguageSwitcher currentLocale={locale} dict={dict} />
              <NotificationBell userId={session.user.id!} dict={dict} />
              <UserNavMenu user={user ?? session.user} dict={dict} />
            </div>
          )}
          {!session?.user && (
            <div className="flex items-center gap-6 rtl:flex-row-reverse xl:gap-8">
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

        <div className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rtl:flex-row-reverse sm:gap-2.5 md:hidden">
          {session?.user && (
            <div className="shrink-0">
              <NotificationBell userId={session.user.id!} dict={dict} />
            </div>
          )}

          {/* Mobile Nav */}
          <MobileMenu dir={dir} dict={dict}>
            <div className="flex min-h-full flex-col gap-6 py-4 sm:gap-7 sm:py-6" dir={dir}>
              <div className="w-full max-w-sm self-center">
                <Link href="/browse" className={mobileNavLinkClass}>
                  {t.browse}
                </Link>
              </div>

              {session?.user && (
                <div className="flex w-full max-w-sm self-center flex-col gap-4">
                  <div className={mobileSectionCardClass}>
                    <div className="flex w-full items-center gap-3 rtl:flex-row-reverse">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                        {user?.image ? (
                          <NextImage
                            src={user.image}
                            alt={t.user}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 font-display text-2xl text-primary">
                            {user?.name?.charAt(0)?.toUpperCase() ||
                              user?.email?.charAt(0)?.toUpperCase() ||
                              "U"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 rtl:text-right">
                        <p className="font-interface text-sm font-semibold text-foreground truncate">
                          {user?.name}
                        </p>
                        <p className="mt-0.5 truncate font-interface text-xs uppercase tracking-widest text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2.5">
                      <Link
                        href="/dashboard"
                        className="flex w-full items-center gap-3 rounded-xs border border-border bg-background/60 px-4 py-3.5 text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/5 hover:text-primary rtl:flex-row-reverse"
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span className="font-interface text-xs uppercase tracking-[0.24em]">
                          {t.dashboard}
                        </span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex w-full items-center gap-3 rounded-xs border border-border bg-background/60 px-4 py-3.5 text-muted-foreground transition-all hover:border-primary/25 hover:bg-primary/5 hover:text-primary rtl:flex-row-reverse"
                      >
                        <Settings className="h-4 w-4 shrink-0" />
                        <span className="font-interface text-xs uppercase tracking-[0.24em]">
                          {t.settings}
                        </span>
                      </Link>
                    </div>
                  </div>

                  {canUseSecureActions ? (
                    <Link href="/items/new" className={mobilePrimaryActionClass}>
                      {t.reportItem}
                    </Link>
                  ) : (
                    <span className={mobileDisabledActionClass}>
                      {t.verifyActionLabel}
                    </span>
                  )}

                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <div className="rounded-sm border border-primary/10 bg-primary/5 p-4">
                      <div className="flex flex-col gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          {t.theme}
                        </span>
                        <div className="w-full [&>button]:w-full [&>button]:justify-center">
                          <ThemeSwitcher {...dict} />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-sm border border-primary/10 bg-primary/5 p-4">
                      <div className="flex flex-col gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          {t.language}
                        </span>
                        <div className="w-full [&>button]:w-full [&>button]:justify-center">
                          <LanguageSwitcher currentLocale={locale} dict={dict} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <form action={handleSignOut} className="w-full">
                    <button
                      type="submit"
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xs border border-red-500/20 px-4 py-4 font-interface text-sm font-medium uppercase tracking-[0.24em] text-red-400 transition-all hover:bg-red-500/10 rtl:flex-row-reverse"
                    >
                      {t.signOut}
                      <LogOut
                        className="h-5 w-5"
                        strokeWidth={2.5}
                      />
                    </button>
                  </form>
                </div>
              )}

              {!session?.user && (
                <div className="flex w-full max-w-sm self-center flex-col gap-4">
                  <div className="grid w-full gap-3 sm:grid-cols-2">
                    <div className="rounded-sm border border-primary/10 bg-primary/5 p-4">
                      <div className="flex flex-col gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          {t.theme}
                        </span>
                        <div className="w-full [&>button]:w-full [&>button]:justify-center">
                          <ThemeSwitcher {...dict} />
                        </div>
                      </div>
                    </div>
                    <div className="rounded-sm border border-primary/10 bg-primary/5 p-4">
                      <div className="flex flex-col gap-3">
                        <span className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                          {t.language}
                        </span>
                        <div className="w-full [&>button]:w-full [&>button]:justify-center">
                          <LanguageSwitcher currentLocale={locale} dict={dict} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/login" className={mobileSecondaryActionClass}>
                    {t.signIn}
                  </Link>
                  <Link href="/register" className={mobilePrimaryActionClass}>
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
