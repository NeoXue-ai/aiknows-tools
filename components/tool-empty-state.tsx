import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";

export function ToolEmptyState({
  onClear,
  hasFilters = true,
}: {
  onClear?: () => void;
  hasFilters?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/8 text-accent">
        <SearchX className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em] text-foreground">
        No tools found
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "Try a different search, clear a filter, or submit a tool we should add to the directory."
          : "Try a different search, or submit a tool we should add to the directory."}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        {onClear && hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="action-secondary"
          >
            Clear filters
          </button>
        )}
        <Link
          href="/submit"
          className="action-primary group"
        >
          Submit a tool
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
