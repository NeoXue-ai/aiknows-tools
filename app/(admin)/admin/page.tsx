import Link from "next/link";
import { Inbox, CheckCheck, Wrench, FolderTree, ArrowRight } from "lucide-react";
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
import type { Submission, Tool } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

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
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Quick overview of submissions, approved tools, and directory status.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending submissions"
          value={pendingCount ?? 0}
          icon={<Inbox className="h-4 w-4" />}
          href="/admin/submissions"
        />
        <StatCard
          label="Approved submissions"
          value={approvedSubmissionsCount ?? 0}
          icon={<CheckCheck className="h-4 w-4" />}
        />
        <StatCard
          label="Approved tools"
          value={totalApprovedToolsCount ?? 0}
          icon={<Wrench className="h-4 w-4" />}
          href="/admin/tools"
        />
        <StatCard
          label="Active directories"
          value={totalActiveDirectoriesCount ?? 0}
          icon={<FolderTree className="h-4 w-4" />}
          href="/admin/directories"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review queue</CardTitle>
            <CardDescription>
              New submissions waiting on your review.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">{pendingCount ?? 0}</span>
            <Link
              href="/admin/submissions"
              className={cn(buttonVariants({ size: "sm" }))}
            >
              Open queue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tools library</CardTitle>
            <CardDescription>
              Approve, unpublish, and feature approved tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-3xl font-bold">
              {totalApprovedToolsCount ?? 0}
            </span>
            <Link
              href="/admin/tools"
              className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
            >
              Manage tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>
              The last 5 submissions that were approved.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No approved submissions yet.
              </p>
            ) : (
              <ul className="divide-y">
                {recentItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{item.tool_name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.tool_url} · {item.submitter_email}
                      </p>
                    </div>
                    <Badge variant="secondary">Approved</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
}) {
  const body = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {body}
      </Link>
    );
  }
  return body;
}
