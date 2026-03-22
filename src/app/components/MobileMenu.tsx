"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function MobileMenu({ children }: { children: React.ReactNode }) {
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
    <div
      className="fixed inset-0 bg-[#080810]/98 backdrop-blur-3xl z-[100] flex flex-col items-center justify-start py-20 px-6 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#C4A35A]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Close button */}
      <button
        className="absolute top-8 right-8 text-[#C4A35A] text-4xl p-2 hover:scale-110 active:scale-95 transition-all duration-300"
        onClick={() => setIsOpen(false)}
        aria-label="Close menu"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Content */}
      <div
        className="w-full max-w-sm relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  return (
    <div className="md:hidden flex items-center">
      {/* Open button */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-[#C4A35A] text-2xl p-2 hover:opacity-70 active:scale-90 transition-all"
        aria-label="Open menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Portal */}
      {mounted && isOpen && createPortal(menuOverlay, document.body)}
    </div>
  );
}