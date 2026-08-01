"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
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

function buildHref(
  pathname: string,
  currentParams: URLSearchParams,
  nextPage: number,
): string {
  const params = new URLSearchParams(currentParams);
  if (nextPage <= 1) params.delete("page");
  else params.set("page", String(nextPage));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ToolPagination({ currentPage, totalPages }: Props) {
  const pathname = usePathname() ?? "/tools";
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;
  const pages = pageRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Page {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(pathname, searchParams, currentPage - 1)}
          aria-disabled={currentPage <= 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card/60 px-2.5 text-xs font-medium transition-colors",
            currentPage <= 1
              ? "pointer-events-none cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </Link>
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
            <Link
              key={p}
              href={buildHref(pathname, searchParams, p)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-md border px-2 font-mono text-xs tabular-nums transition-colors",
                p === currentPage
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-card/60 text-muted-foreground hover:text-foreground",
              )}
            >
              {p}
            </Link>
          ),
        )}
        <Link
          href={buildHref(pathname, searchParams, currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={cn(
            "inline-flex h-8 items-center gap-1 rounded-md border border-border bg-card/60 px-2.5 text-xs font-medium transition-colors",
            currentPage >= totalPages
              ? "pointer-events-none cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}
