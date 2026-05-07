"use client";

import { useState, useEffect, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { X, Menu } from "lucide-react";
import type { Dictionary } from "@/lib/dictionary.types";

export default function MobileMenu({
  children,
  dir = "ltr",
  dict,
}: {
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
  dict: Dictionary;
}) {
  const t = dict.ui;
  const [isOpen, setIsOpen] = useState(false);
  const isMenuOpen = isOpen;
  const canUseDOM = typeof document !== "undefined";
  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleMenuContentClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const clickedLink = target.closest("a[href]");
    if (clickedLink) {
      closeMenu();
    }
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const menuOverlay = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-100 bg-background/40 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu Content */}
      <div
        dir={dir}
        className="fixed inset-y-0 right-0 z-110 w-100 max-w-[24rem] overflow-y-auto overflow-x-hidden bg-background shadow-2xl animate-in duration-300 ease-out sm:max-w-104 border-l border-primary/15 slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative center glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />

        {/* Close button */}
        <button
          type="button"
          className="absolute right-4 top-5 z-20 p-2 text-primary transition-all duration-300 hover:scale-110 active:scale-95 sm:right-6 sm:top-6"
          onClick={closeMenu}
          aria-label={t.closeMenu}
        >
          <X className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2} />
        </button>

        {/* Content */}
        <div
          className="relative z-10 w-full overflow-x-hidden p-4 pt-18 sm:p-6 sm:pt-20"
          onClickCapture={handleMenuContentClickCapture}
        >
          {children}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex items-center md:hidden">
      {/* Open button */}
      <button
        type="button"
        onClick={openMenu}
        className="rounded-full border border-primary/15 bg-card/40 p-2.5 text-primary transition-all hover:border-primary/30 hover:bg-primary/5 hover:opacity-90 active:scale-90"
        aria-label={t.openMenu}
      >
        <Menu className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
      </button>

      {/* Portal */}
      {canUseDOM && isMenuOpen && createPortal(menuOverlay, document.body)}
    </div>
  );
}
