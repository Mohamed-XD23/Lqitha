"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

export default function MobileMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(true)} 
        className="text-[#C4A35A] text-xl p-2"
        aria-label="Open menu"
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#080810] z-40 flex flex-col items-center justify-center gap-8" 
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-[#C4A35A] text-3xl p-2"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          
          <div 
            className="flex flex-col items-center gap-8" 
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
