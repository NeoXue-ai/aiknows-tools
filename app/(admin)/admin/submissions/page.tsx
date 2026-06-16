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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground">
          {submissions.length === 0
            ? "No pending submissions right now."
            : `${submissions.length} pending ${
                submissions.length === 1 ? "submission" : "submissions"
              } to review.`}
        </p>
      </header>

      <AdminReviewQueue
        submissions={submissions}
        categoriesBySlug={categoriesBySlug}
      />
    </div>
  );
}
