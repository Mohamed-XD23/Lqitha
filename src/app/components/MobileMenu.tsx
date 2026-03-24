"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { X, Menu } from "lucide-react";

export default function MobileMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change during render to avoid cascading effects
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (isOpen) setIsOpen(false);
  }

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const menuOverlay = (
    <div onClick={() => setIsOpen(false)}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-obsidian/40 backdrop-blur-md z-100 transition-opacity animate-in fade-in duration-300" />

      {/* Menu Content */}
      <div
        className="fixed top-0 bottom-0 ltr:right-0 rtl:left-0 w-[400px] max-w-[90vw] bg-obsidian border-l border-gold/15 z-100 shadow-2xl overflow-y-auto animate-in ltr:slide-in-from-right rtl:slide-in-from-left duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Close button */}
        <button
          className="absolute top-8 ltr:right-8 rtl:left-8 text-gold text-4xl p-2 hover:scale-110 active:scale-95 transition-all duration-300"
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
        >
          <X className="w-9 h-9" strokeWidth={2} />
        </button>

        {/* Content */}
        <div className="w-full relative z-10 p-6 pt-20">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:hidden flex items-center">
      {/* Open button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gold text-2xl p-2 hover:opacity-70 active:scale-90 transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* Portal */}
      {mounted && isOpen && createPortal(menuOverlay, document.body)}
    </div>
  );
}
