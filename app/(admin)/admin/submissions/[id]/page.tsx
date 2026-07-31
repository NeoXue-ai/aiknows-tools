import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CircleCheck,
  CircleX,
  Clock,
  FileText,
  Image as ImageIcon,
  Mail,
  Send,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const supabase = createAdminClient();
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
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin/submissions"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-muted-foreground hover:text-foreground",
          )}
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to queue
        </Link>
        <SubmissionStatusBadge status={submission.status} />
      </div>

      <header className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Submission review
        </p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          {submission.tool_name}
        </h1>
        <a
          href={submission.tool_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {submission.tool_url}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  About this submission
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight">
                  Submission details
                </h2>
              </div>
            </div>

            <div className="space-y-5 text-sm">
              <DetailRow label="Description">
                {submission.description ? (
                  <p className="whitespace-pre-wrap text-pretty leading-relaxed text-foreground">
                    {submission.description}
                  </p>
                ) : (
                  <span className="text-muted-foreground">
                    (no description provided)
                  </span>
                )}
              </DetailRow>

              <DetailRow label="Category">
                {category ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                    {category.name}
                  </span>
                ) : submission.category ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {submission.category}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>

              <DetailRow label="Pricing">
                {submission.pricing_type ? (
                  <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                    {submission.pricing_type}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </DetailRow>

              <DetailRow
                label="Logo URL"
                icon={ImageIcon}
              >
                {submission.logo_url ? (
                  <a
                    href={submission.logo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-foreground transition-colors hover:text-accent"
                  >
                    {submission.logo_url}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </DetailRow>

              <DetailRow
                label="Screenshot URL"
                icon={ImageIcon}
              >
                {submission.screenshot_url ? (
                  <a
                    href={submission.screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-foreground transition-colors hover:text-accent"
                  >
                    {submission.screenshot_url}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not provided</span>
                )}
              </DetailRow>

              {submission.rejection_reason ? (
                <DetailRow label="Rejection reason" icon={FileText}>
                  <p className="whitespace-pre-wrap text-pretty text-foreground">
                    {submission.rejection_reason}
                  </p>
                </DetailRow>
              ) : null}

              {submission.reviewed_at ? (
                <DetailRow label="Reviewed at" icon={Clock}>
                  <span className="font-mono text-xs text-foreground/80">
                    {formatDate(submission.reviewed_at)}
                  </span>
                </DetailRow>
              ) : null}
            </div>
          </section>

          <section className="rounded-xl border border-border/60 bg-card/40 p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Submitter
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight">
              Contact
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <ContactRow icon={Mail} label="Email">
                <a
                  href={`mailto:${submission.submitter_email}`}
                  className="text-foreground transition-colors hover:text-accent"
                >
                  {submission.submitter_email}
                </a>
              </ContactRow>
              <ContactRow icon={Send} label="Submitted">
                <span className="font-mono text-xs text-foreground/80">
                  {formatDate(submission.created_at)}
                </span>
              </ContactRow>
            </div>
          </section>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
            <div className="border-b border-border/40 p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Decision
              </p>
              <h2 className="mt-1 text-base font-semibold tracking-tight">
                Review outcome
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {isClosed
                  ? "This submission has already been actioned."
                  : "Approve to publish, or reject with a reason."}
              </p>
            </div>
            <div className="p-6">
              {isClosed ? (
                <p className="text-sm text-muted-foreground">
                  No further action available.
                </p>
              ) : (
                <AdminSubmissionActions submissionId={submission.id} />
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[140px_1fr] sm:items-start">
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[140px_1fr] sm:items-start">
      <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  );
}

function SubmissionStatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CircleCheck className="h-3.5 w-3.5" />
        Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
        <CircleX className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
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