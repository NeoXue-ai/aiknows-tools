"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      inputRef.current?.focus();
      return;
    }
    router.push(`/tools?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 w-full max-w-xl" role="search">
      <label htmlFor="hero-search" className="sr-only">
        Search the AIknows index
      </label>
      <div
        className={cn(
          "flex h-14 items-center gap-3 border border-border bg-card px-4 transition-colors duration-200",
          focused ? "border-accent" : "hover:border-foreground/25",
        )}
      >
        <Search className={cn("h-5 w-5 shrink-0", focused ? "text-accent" : "text-muted-foreground")} />
        <input
          id="hero-search"
          ref={inputRef}
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search a task, category, or tool"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <span className="hidden items-center gap-1 border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
          ⌘ K
        </span>
        <button
          type="submit"
          className="hidden h-8 items-center gap-1 border border-accent px-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
        >
          <CornerDownLeft className="h-3 w-3" />
          Search
        </button>
      </div>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
        Search matches names, descriptions, categories, and recorded tags.
      </p>
    </form>
  );
}
