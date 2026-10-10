"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return <button type="button" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} aria-label="Toggle color theme" className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
    <Moon aria-hidden className="h-[17px] w-[17px] dark:hidden" strokeWidth={1.6} /><Sun aria-hidden className="hidden h-[18px] w-[18px] dark:block" strokeWidth={1.6} />
  </button>;
}
