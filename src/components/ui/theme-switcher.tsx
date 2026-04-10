"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — render only after mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="flex items-center justify-centerw-9 h-9 rounded-smborder border-border bg-(--surface) text-muted hover:text-(--gold) hover:border-(--gold) transition-colors duration-200
      "
    >
      {isDark ? (
        <div className="flex items-center gap-2 border py-1 px-2 rounded-full border-gold/20 text-secondary hover:text-primary hover:bg-background ">
          {" "}
          <Sun size={20} />
          <span>Light</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 border py-1 px-2 rounded-full border-gold/20 text-secondary hover:text-primary hover:bg-background ">
          {" "}
          <Moon size={20} />
          <span>Dark</span>
        </div>
      )}
    </button>
  );
}
