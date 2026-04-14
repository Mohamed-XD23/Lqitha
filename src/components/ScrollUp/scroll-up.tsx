"use client";
import { ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Dictionary } from "@/lib/dictionary.types";

interface ScrollUpProps {
  dict: Dictionary;
}

export default function ScrollUp({ dict }: ScrollUpProps) {
  const t = dict.ui;
  const [isExpanded, setIsExpanded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [supportsHover, setSupportsHover] = useState(false);

  useEffect(() => {
  const mediaQuery = window.matchMedia("(hover: hover)");
  setSupportsHover(mediaQuery.matches); // set on client after hydration

  const handleScroll = () => setVisible(window.scrollY > 300);
  window.addEventListener("scroll", handleScroll);

  const handleMediaChange = (e: MediaQueryListEvent) => {
    setSupportsHover(e.matches);
  };
  mediaQuery.addEventListener("change", handleMediaChange);

  return () => {
    window.removeEventListener("scroll", handleScroll);
    mediaQuery.removeEventListener("change", handleMediaChange);
  };
}, []);

  const scrollToTop = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="w-fit h-fit p-1 bg-primary/20 rounded-full fixed bottom-5 right-5 z-50 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        className="h-12 flex flex-row items-center justify-center bg-primary rounded-full cursor-pointer hover:bg-primary/90 transition-all duration-300 overflow-hidden"
        style={{
          width: isExpanded ? "8.75rem" : "3rem",
          gap: isExpanded ? "0.5rem" : "0rem",
        }}
        onMouseEnter={() => supportsHover && setIsExpanded(true)}
        onMouseLeave={() => supportsHover && setIsExpanded(false)}
        onClick={scrollToTop}
      >
        <ArrowUp size={20} className="text-background shrink-0" />
        {supportsHover && (
          <span
            className="text-background text-sm font-medium whitespace-nowrap transition-all duration-300"
            style={{
              maxWidth: isExpanded ? "6rem" : "0px",
              opacity: isExpanded ? 1 : 0,
            }}
          >
            {t.ScrollUp}
          </span>
        )}
      </button>
    </div>
  );
}
