"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

function pageRange(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...wanted].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p > prev + 1) items.push("…");
    items.push(p);
    prev = p;
  }
  return items;
}

export function ToolPagination({ currentPage, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null;
  const pages = pageRange(currentPage, totalPages);
  const go = (n: number) => {
    if (n < 1 || n > totalPages || n === currentPage) return;
    onChange(n);
  };

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Page {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card/60 px-2.5 text-xs font-medium transition-colors",
            currentPage <= 1
              ? "cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`gap-${idx}`}
              aria-hidden
              className="px-1 font-mono text-xs text-muted-foreground/50"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 font-mono text-xs tabular-nums transition-colors",
                p === currentPage
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card/60 px-2.5 text-xs font-medium transition-colors",
            currentPage >= totalPages
              ? "cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </nav>
  );
}