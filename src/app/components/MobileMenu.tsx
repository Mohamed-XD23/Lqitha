"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";

export default function MobileMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
      className="fixed inset-0 bg-[#080810]/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-start py-20 px-6 overflow-y-auto"
      onClick={() => setIsOpen(false)}
    >
      {/* Close button */}
      <button
        className="absolute top-8 right-8 text-gold text-4xl p-2 hover:scale-110 transition-transform"
        onClick={() => setIsOpen(false)}
        aria-label="Close menu"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Content */}
      <div
        className="w-full max-w-sm"
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
        className="text-gold text-2xl p-2 hover:opacity-80 transition-opacity"
        aria-label="Open menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Portal */}
      {mounted && isOpen && createPortal(menuOverlay, document.body)}
    </div>
  );
}