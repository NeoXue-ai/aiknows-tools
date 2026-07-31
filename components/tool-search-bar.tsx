"use client";

import { useEffect, useRef, useState } from "react";
import { Search, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const SEARCH_EXAMPLES = ["meeting transcription", "API testing", "image generation"];

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ToolSearchBar({
  value,
  onChange,
  placeholder = "Search AI tools...",
  autoFocus,
}: Props) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K to focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-full">
      <label htmlFor="tool-search" className="sr-only">
        Search AI tools
      </label>
      <div
        className={cn(
          "group relative flex h-14 items-center gap-3 border bg-card px-4 transition-colors duration-200",
          focused ? "border-accent" : "border-border hover:border-foreground/25",
        )}
      >
        <Search
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            focused ? "text-accent" : "text-muted-foreground",
          )}
        />
        <input
          id="tool-search"
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Search AI tools"
          autoFocus={autoFocus}
          className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <span
          aria-hidden
          className="hidden items-center gap-1 border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex"
        >
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </span>
        <button
          type="button"
          aria-label="Search"
          onClick={() => inputRef.current?.focus()}
          className="hidden h-8 items-center gap-1 border border-accent px-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
        >
          <CornerDownLeft className="h-3 w-3" />
          Search
        </button>
      </div>

      <ul className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <li className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Examples</li>
        {SEARCH_EXAMPLES.map((ex) => (
          <li key={ex}>
            <button
              type="button"
              onClick={() => {
                onChange(ex);
                inputRef.current?.focus();
              }}
              className="border border-border px-2 py-1 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {ex}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}