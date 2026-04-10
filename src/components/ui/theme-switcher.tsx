"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Dictionary } from "@/lib/dictionary.types";

export function ThemeSwitcher(dict: Dictionary) {
  const t = dict.theme;
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Acard hydration mismatch — render only after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
    >
      {isDark ? (
        <div className="flex items-center gap-2">
          {" "}
          <Sun size={18} />
          <span className="font-interface text-xs font-medium uppercase tracking-widest mt-px">{t.light}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {" "}
          <Moon size={18} />
          <span className="font-interface text-xs font-medium uppercase tracking-widest mt-px">{t.dark}</span>
        </div>
      )}
    </button>
  );
}
