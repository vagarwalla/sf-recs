"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={`w-10 h-10 ${className}`} />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-card border border-card-border text-foreground hover:bg-accent hover:text-white transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
