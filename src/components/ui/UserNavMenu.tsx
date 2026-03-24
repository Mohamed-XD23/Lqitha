"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { LayoutDashboard, Settings, LogOut, User as UserIcon } from "lucide-react";
import { handleSignOut } from "@/actions/auth.actions";

interface UserNavMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  dict: {
    nav: {
      dashboard: string;
      settings: string;
      signOut: string;
    };
  };
}

export default function UserNavMenu({ user, dict }: UserNavMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const positionPanel = () => {
      if (!panelRef.current) return;
      const viewportPadding = 8;
      // Always measure from the unshifted base state to avoid drift on repeated scroll updates.
      panelRef.current.style.transform = "translateX(-50%)";
      const rect = panelRef.current.getBoundingClientRect();

      let shift = 0;
      if (rect.left < viewportPadding) {
        shift = viewportPadding - rect.left;
      } else if (rect.right > window.innerWidth - viewportPadding) {
        shift = window.innerWidth - viewportPadding - rect.right;
      }

      panelRef.current.style.transform = `translateX(calc(-50% + ${shift}px))`;
    };

    const rafId = window.requestAnimationFrame(positionPanel);
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [isOpen]);

  const initials = user.name ? user.name.charAt(0).toUpperCase() : "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 focus:outline-none group"
        aria-label="User menu"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gold/20 group-hover:border-gold/50 transition-all flex items-center justify-center bg-gold/10">
          {user.image ? (
            <NextImage
              src={user.image}
              alt={user.name || "User"}
              width={36}
              height={36}
              className="object-cover"
            />
          ) : (
            <span className="font-display text-gold text-lg">
              {initials || <UserIcon className="w-5 h-5 text-gold" />}
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-gold/35 transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="absolute left-1/2 mt-3 w-64 max-w-[calc(100vw-1rem)] bg-obsidian border border-gold/15 rounded-sm shadow-2xl z-50 overflow-visible origin-top"
          style={{ transform: "translateX(-50%)" }}
        >
          <div className="p-4 border-b border-gold/10 bg-void/50 text-left ltr:text-left rtl:text-right">
            <p className="font-interface text-sm font-semibold text-ivory truncate">{user.name}</p>
            <p className="font-interface text-[10px] text-slate truncate uppercase tracking-widest mt-0.5">{user.email}</p>
          </div>

          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate hover:text-gold hover:bg-gold/5 transition-all group"
            >
              <LayoutDashboard className="w-4 h-4 text-slate group-hover:text-gold" strokeWidth={2} />
              <span className="font-interface text-[11px] font-medium tracking-[2px] uppercase">{dict.nav.dashboard}</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xs text-slate hover:text-gold hover:bg-gold/5 transition-all group"
            >
              <Settings className="w-4 h-4 text-slate group-hover:text-gold" strokeWidth={2} />
              <span className="font-interface text-[11px] font-medium tracking-[2px] uppercase">{dict.nav.settings}</span>
            </Link>

            <div className="my-1 border-t border-gold/5" />

            <form action={handleSignOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-red-400 hover:bg-red-500/10 transition-all group"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                <span className="font-interface text-[11px] font-medium tracking-[2px] uppercase">{dict.nav.signOut}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
