import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { Category, Submission } from "@/lib/supabase/types";

type Item = Pick<
  Submission,
  | "id"
  | "tool_name"
  | "tool_url"
  | "submitter_email"
  | "category"
  | "created_at"
>;

interface AdminReviewQueueProps {
  submissions: Item[];
  categoriesBySlug: Record<string, Pick<Category, "slug" | "name">>;
}

export function AdminReviewQueue({
  submissions,
  categoriesBySlug,
}: AdminReviewQueueProps) {
  if (submissions.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-muted-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">You&apos;re all caught up</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            No pending submissions. New entries will appear here as soon as
            they&apos;re submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
      <ul className="divide-y divide-border/40">
        {submissions.map((s) => {
          const categoryName = s.category
            ? categoriesBySlug[s.category]?.name ?? s.category
            : null;
          return (
            <li
              key={s.id}
              className="group/queue relative flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-secondary/20 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.tool_name}
                  </p>
                  {categoryName ? (
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                      {categoryName}
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      No category
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                </div>
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  <a
                    href={s.tool_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-foreground"
                  >
                    {s.tool_url}
                  </a>
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {s.submitter_email} · {formatDate(s.created_at)}
                </p>
              </div>
              <Link
                href={`/admin/submissions/${s.id}`}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "shrink-0 gap-1.5 transition-colors group-hover/queue:border-accent/40 group-hover/queue:text-accent",
                )}
              >
                Review
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/queue:translate-x-0.5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}