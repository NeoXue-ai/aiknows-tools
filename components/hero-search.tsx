"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const SUGGESTIONS = [
  { label: "Design something", category: "image-video" },
  { label: "Write better", category: "writing-content" },
  { label: "Build with AI", category: "code-development" },
];

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
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
    router.push(query ? `/tools?q=${encodeURIComponent(query)}` : "/tools");
  }

  return (
    <div className="mx-auto mt-9 w-full max-w-[620px] sm:mt-10">
      <form onSubmit={onSubmit} role="search" className="flex h-[66px] items-center gap-3 rounded-2xl border border-input bg-card p-2 pl-5 shadow-[0_4px_20px_rgba(32,39,34,0.035)] transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--emphasis)]">
        <Search aria-hidden className="h-5 w-5 shrink-0 text-muted-foreground" strokeWidth={1.6} />
        <label htmlFor="hero-search" className="sr-only">Search AI tools</label>
        <input id="hero-search" ref={inputRef} type="search" value={value} onChange={(event) => setValue(event.target.value)} placeholder="What would you like to create?" className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none" />
        <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-1 text-[11px] text-muted-foreground sm:block">⌘ K</kbd>
        <button type="submit" aria-label="Search tools" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90">
          <ArrowRight aria-hidden className="h-5 w-5" />
        </button>
      </form>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-[13px]">
        <span className="text-muted-foreground">A few ideas:</span>
        {SUGGESTIONS.map((suggestion) => <Link key={suggestion.category} href={`/categories/${suggestion.category}`} className="text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">{suggestion.label}</Link>)}
      </div>
    </div>
  );
}
