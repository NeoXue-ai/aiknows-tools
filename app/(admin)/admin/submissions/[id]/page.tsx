import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminSubmissionActions } from "@/components/AdminSubmissionActions";
import type { Category, Submission } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminSubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("[admin/submissions/[id]] fetch failed:", error);
    notFound();
  }

  const submission = data as Submission;

  const { data: categoryData } = await supabase
    .from("categories")
    .select("slug, name")
    .eq("slug", submission.category ?? "")
    .maybeSingle();

  const category = categoryData as Pick<Category, "slug" | "name"> | null;

  const isClosed = submission.status !== "pending";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/submissions"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to queue
        </Link>
        <Badge
          variant={
            submission.status === "approved"
              ? "default"
              : submission.status === "rejected"
                ? "destructive"
                : "secondary"
          }
        >
          {submission.status}
        </Badge>
      </div>

      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {submission.tool_name}
        </h1>
        <p className="text-muted-foreground">
          <a
            href={submission.tool_url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {submission.tool_url}
          </a>
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Submission details</CardTitle>
            <CardDescription>
              Submitted by {submission.submitter_email} on{" "}
              {formatDate(submission.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <DetailRow label="Description">
              <p className="whitespace-pre-wrap text-foreground">
                {submission.description ?? "(no description)"}
              </p>
            </DetailRow>

            <DetailRow label="Category">
              {category ? (
                <Badge variant="secondary">{category.name}</Badge>
              ) : submission.category ? (
                <Badge variant="outline">{submission.category}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>

            <DetailRow label="Pricing">
              {submission.pricing_type ? (
                <Badge variant="outline">{submission.pricing_type}</Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </DetailRow>

            <DetailRow label="Logo URL">
              {submission.logo_url ? (
                <a
                  href={submission.logo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {submission.logo_url}
                </a>
              ) : (
                <span className="text-muted-foreground">Not provided</span>
              )}
            </DetailRow>

            <DetailRow label="Screenshot URL">
              {submission.screenshot_url ? (
                <a
                  href={submission.screenshot_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-primary hover:underline"
                >
                  {submission.screenshot_url}
                </a>
              ) : (
                <span className="text-muted-foreground">Not provided</span>
              )}
            </DetailRow>

            {submission.rejection_reason ? (
              <DetailRow label="Rejection reason">
                <p className="whitespace-pre-wrap text-foreground">
                  {submission.rejection_reason}
                </p>
              </DetailRow>
            ) : null}

            {submission.reviewed_at ? (
              <DetailRow label="Reviewed at">
                {formatDate(submission.reviewed_at)}
              </DetailRow>
            ) : null}
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Decision</CardTitle>
              <CardDescription>
                {isClosed
                  ? "This submission has already been actioned."
                  : "Approve to publish, or reject with a reason."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isClosed ? (
                <p className="text-sm text-muted-foreground">
                  No further action available.
                </p>
              ) : (
                <AdminSubmissionActions submissionId={submission.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_1fr]">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div>{children}</div>
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
