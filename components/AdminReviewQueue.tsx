import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
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
      <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
        <p className="text-lg">No pending submissions. 🎉</p>
        <p className="mt-1 text-sm">You&apos;re all caught up.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border bg-card">
      {submissions.map((s) => {
        const categoryName = s.category
          ? categoriesBySlug[s.category]?.name ?? s.category
          : null;
        return (
          <li
            key={s.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-medium">{s.tool_name}</p>
                {categoryName ? (
                  <Badge variant="secondary">{categoryName}</Badge>
                ) : (
                  <Badge variant="outline">No category</Badge>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">
                <a
                  href={s.tool_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {s.tool_url}
                </a>
              </p>
              <p className="text-xs text-muted-foreground">
                {s.submitter_email} · {formatDate(s.created_at)}
              </p>
            </div>
            <Link
              href={`/admin/submissions/${s.id}`}
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </li>
        );
      })}
    </ul>
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
