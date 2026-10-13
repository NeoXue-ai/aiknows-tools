import Link from "next/link";
import { browsePath, paginationRange } from "../urls";
export function CatalogPagination({
  page,
  totalPages,
  basePath,
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  const item =
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border px-3 text-sm hover:bg-secondary";
  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8"
    >
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {page > 1 && (
          <Link
            className={item}
            href={browsePath(basePath, page - 1)}
            rel="prev"
          >
            Previous
          </Link>
        )}
        {paginationRange(page, totalPages).map((n, i) =>
          n === "…" ? (
            <span key={`gap-${i}`} aria-hidden>
              …
            </span>
          ) : (
            <Link
              key={n}
              className={item}
              aria-current={n === page ? "page" : undefined}
              href={browsePath(basePath, n)}
            >
              {n}
            </Link>
          ),
        )}
        {page < totalPages && (
          <Link
            className={item}
            href={browsePath(basePath, page + 1)}
            rel="next"
          >
            Next
          </Link>
        )}
      </div>
    </nav>
  );
}
