import Link from "next/link";
import { Inbox } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminReviewQueue } from "@/components/AdminReviewQueue";
import type { Category, Submission } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submissions | Admin" };

export default async function AdminSubmissionsPage() {
  const supabase = createAdminClient();

  const [{ data: pendingData, error: pendingError }, { data: categoryData }] =
    await Promise.all([
      supabase
        .from("submissions")
        .select("id, tool_name, tool_url, submitter_email, category, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("slug, name"),
    ]);

  if (pendingError) {
    console.error("[admin/submissions] pending fetch failed:", pendingError);
  }

  const submissions = (pendingData ?? []) as Pick<
    Submission,
    | "id"
    | "tool_name"
    | "tool_url"
    | "submitter_email"
    | "category"
    | "created_at"
  >[];

  const categoriesBySlug: Record<string, Pick<Category, "slug" | "name">> = {};
  for (const c of (categoryData ?? []) as Pick<Category, "slug" | "name">[]) {
    categoriesBySlug[c.slug] = c;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
            Review queue
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Submissions
          </h1>
          <p className="mt-2 max-w-prose text-pretty text-sm text-muted-foreground">
            {submissions.length === 0
              ? "No pending submissions right now."
              : `${submissions.length} pending ${
                  submissions.length === 1 ? "submission" : "submissions"
                } to review. Approve to publish, or reject with a reason.`}
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Inbox className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </header>

      <AdminReviewQueue
        submissions={submissions}
        categoriesBySlug={categoriesBySlug}
      />
    </div>
  );
}