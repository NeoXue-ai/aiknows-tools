"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { browsePath, paginationRange } from "@/features/catalog/urls";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

function buildHref(
  pathname: string,
  currentParams: URLSearchParams,
  nextPage: number,
  basePath?: string,
): string {
  if (pathname !== "/search") {
    const view = currentParams.get("view");
    return (
      browsePath(basePath ?? pathname.replace(/\/page\/\d+$/, ""), nextPage) +
      (view ? `?view=${view}` : "")
    );
  }
  const params = new URLSearchParams(currentParams);
  if (nextPage <= 1) params.delete("page");
  else params.set("page", String(nextPage));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function ToolPagination({ currentPage, totalPages, basePath }: Props) {
  const pathname = usePathname() ?? "/tools";
  const searchParams = useSearchParams();
  if (totalPages <= 1) return null;
  const pages = paginationRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
    >
      <p className="text-[13px] tabular-nums text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex max-w-full flex-wrap items-center gap-1 sm:gap-1.5">
        <Link
          href={buildHref(pathname, searchParams, currentPage - 1, basePath)}
          aria-disabled={currentPage <= 1}
          aria-label="Previous page"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-2 text-[13px] font-medium transition-colors sm:h-10 sm:px-3",
            currentPage <= 1
              ? "pointer-events-none cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:border-accent/30 hover:text-accent",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
        {pages.map((p, idx) =>
          p === "…" ? (
            <span
              key={`gap-${idx}`}
              aria-hidden
              className="px-1 text-sm text-muted-foreground/50"
            >
              …
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref(pathname, searchParams, p, basePath)}
              aria-current={p === currentPage ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-8 items-center justify-center rounded-xl border px-2 text-[13px] tabular-nums transition-colors sm:h-10 sm:min-w-10",
                p === currentPage
                  ? "border-accent/20 bg-accent/10 font-semibold text-accent"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground",
              )}
            >
              {p}
            </Link>
          ),
        )}
        <Link
          href={buildHref(pathname, searchParams, currentPage + 1, basePath)}
          aria-disabled={currentPage >= totalPages}
          aria-label="Next page"
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-card px-2 text-[13px] font-medium transition-colors sm:h-10 sm:px-3",
            currentPage >= totalPages
              ? "pointer-events-none cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:border-accent/30 hover:text-accent",
          )}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </nav>
  );
}
