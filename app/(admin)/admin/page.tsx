import Link from "next/link";
import {
  ArrowRight,
  CheckCheck,
  CircleCheck,
  FolderTree,
  Inbox,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Submission } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const [
    { count: pendingCount },
    { count: approvedSubmissionsCount },
    { count: totalApprovedToolsCount },
    { count: totalActiveDirectoriesCount },
    { data: recent },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("tools")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("directories")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("submissions")
      .select("id, tool_name, tool_url, submitter_email, created_at")
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .limit(5),
  ]);

  const recentItems = (recent ?? []) as Pick<
    Submission,
    "id" | "tool_name" | "tool_url" | "submitter_email" | "created_at"
  >[];

  return (
    <div className="space-y-10">
      <header>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Overview
        </p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          Quick overview of submissions, approved tools, and directory status.
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending submissions"
          value={pendingCount ?? 0}
          icon={Inbox}
          tone="amber"
          href="/admin/submissions"
        />
        <StatCard
          label="Approved submissions"
          value={approvedSubmissionsCount ?? 0}
          icon={CheckCheck}
          tone="emerald"
        />
        <StatCard
          label="Approved tools"
          value={totalApprovedToolsCount ?? 0}
          icon={Wrench}
          tone="accent"
          href="/admin/tools"
        />
        <StatCard
          label="Active directories"
          value={totalActiveDirectoriesCount ?? 0}
          icon={FolderTree}
          tone="violet"
          href="/admin/directories"
        />
      </section>

      {/* Quick links */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Review queue
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {pendingCount ?? 0}
              </p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                New submissions waiting on your review.
              </p>
            </div>
            <Link
              href="/admin/submissions"
              className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-1.5")}
            >
              Open queue
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/40 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Tools library
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {totalApprovedToolsCount ?? 0}
              </p>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Approve, unpublish, and feature approved tools.
              </p>
            </div>
            <Link
              href="/admin/tools"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "shrink-0 gap-1.5",
              )}
            >
              Manage tools
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border border-border/60 bg-card/40 p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight">
              Recent activity
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The last 5 submissions that were approved.
            </p>
          </div>
        </div>

        {recentItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
            <CircleCheck className="h-6 w-6 text-emerald-500" />
            <p>No approved submissions yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/40">
            {recentItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {item.tool_name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.tool_url} · {item.submitter_email}
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  Approved
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  tone,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  href?: string;
  tone: "amber" | "emerald" | "accent" | "violet";
}) {
  const toneClasses = {
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "border-accent/20 bg-accent/10 text-accent",
    violet:
      "border-violet-500/20 bg-violet-500/10 text-violet-600 dark:text-violet-400",
  } as const;

  const body = (
    <div className="group rounded-xl border border-border/60 bg-card/40 p-5 transition-all hover:border-accent/30 hover:bg-card/60">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
            toneClasses[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {body}
      </Link>
    );
  }
  return body;
}