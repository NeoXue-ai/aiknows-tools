import Link from "next/link";
import { SearchX, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ToolEmptyState({
  onClear,
  hasFilters = true,
}: {
  onClear?: () => void;
  hasFilters?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-secondary/40 text-muted-foreground">
        <SearchX className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-base font-medium text-foreground">
        No matching AI tools found.
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "Try a different search, clear a filter, or submit a tool we should add to the directory."
          : "Try a different search, or submit a tool we should add to the directory."}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {onClear && hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Clear filters
          </button>
        )}
        <Link
          href="/submit"
          className={cn(buttonVariants({ size: "sm" }), "group")}
        >
          Submit a tool
          <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}