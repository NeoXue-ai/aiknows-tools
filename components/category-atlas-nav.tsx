"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type CategoryNavItem = { slug: string; name: string };

export function CategoryAtlasNav({ items }: { items: CategoryNavItem[] }) {
  const [activeSlug, setActiveSlug] = React.useState<string>(items[0]?.slug ?? "");
  const mobileBarRef = React.useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const chip = node.querySelector<HTMLElement>(
      `[data-slug="${items.find((it) => it.slug === activeSlug)?.slug ?? ""}"]`,
    );
    chip?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [items, activeSlug]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = items
      .map((it) => document.getElementById(`cat-${it.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const id = visible[0].target.id.replace(/^cat-/, "");
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => setActiveSlug(id));
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [items]);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, slug: string) {
    const el = typeof document !== "undefined" ? document.getElementById(`cat-${slug}`) : null;
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#cat-${slug}`);
    }
    setActiveSlug(slug);
  }

  return (
    <>
      {/* Desktop: sticky left rail */}
      <nav aria-label="Category sections" className="hidden lg:block">
        <div className="sticky top-24">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Sections
          </p>
          <ul className="border-l border-border/70">
            {items.map((it, i) => {
              const active = it.slug === activeSlug;
              return (
                <li key={it.slug}>
                  <a
                    href={`#cat-${it.slug}`}
                    onClick={(e) => handleClick(e, it.slug)}
                    aria-current={active ? "location" : undefined}
                    className={cn(
                      "flex items-baseline gap-3 border-l-2 -ml-px py-2.5 pl-4 pr-3 transition-colors",
                      active
                        ? "border-accent text-accent"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span className="font-mono text-[10px] tabular-nums tracking-[0.14em]">
                      {String(i).padStart(2, "0")}
                    </span>
                    <span className={cn("text-sm", active && "font-medium")}>
                      {it.name}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile: horizontal chip bar */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-y border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div
          ref={mobileBarRef}
          className="flex overflow-x-auto px-4 py-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((it, i) => {
            const active = it.slug === activeSlug;
            return (
              <a
                key={it.slug}
                href={`#cat-${it.slug}`}
                onClick={(e) => handleClick(e, it.slug)}
                data-slug={it.slug}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "flex shrink-0 snap-center items-baseline gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent/10 text-accent ring-1 ring-accent/40"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className="font-mono text-[10px] tabular-nums tracking-[0.14em]">
                  {String(i).padStart(2, "0")}
                </span>
                <span className="whitespace-nowrap">{it.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </>
  );
}