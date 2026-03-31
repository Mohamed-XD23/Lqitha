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
        className="fixed inset-0 bg-obsidian/40 backdrop-blur-md z-100 transition-opacity animate-in fade-in duration-300"
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Menu Content */}
      <div
        dir={dir}
        className="fixed inset-y-0 right-0 w-100 max-w-[90vw] bg-obsidian z-110 shadow-2xl overflow-y-auto overflow-x-hidden animate-in duration-500 ease-out border-l border-gold/15 slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          className="absolute z-20 top-8 right-8 text-gold text-4xl p-2 hover:scale-110 active:scale-95 transition-all duration-300"
          onClick={closeMenu}
          aria-label={t.closeMenu}
        >
          <X className="w-9 h-9" strokeWidth={2} />
        </button>

        {/* Content */}
        <div
          className="w-full relative z-10 overflow-x-hidden p-6 pt-20"
          onClickCapture={handleMenuContentClickCapture}
        >
          {children}
        </div>
      </div>
    </>
  );

  return (
    <div className="md:hidden flex items-center">
      {/* Open button */}
      <button
        type="button"
        onClick={openMenu}
        className="text-gold text-2xl p-2 hover:opacity-70 active:scale-90 transition-all"
        aria-label={t.openMenu}
      >
        <Menu className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Portal */}
      {canUseDOM && isMenuOpen && createPortal(menuOverlay, document.body)}
    </div>
  );
}
