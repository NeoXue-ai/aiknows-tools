import Link from "next/link";
import { Wrench } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminToolRowActions } from "@/components/AdminToolRowActions";
import { cn } from "@/lib/utils";
import type { Category, Tool } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tools | Admin" };

export default async function AdminToolsPage() {
  const supabase = createAdminClient();

  const [{ data: toolsData, error: toolsError }, { data: categoriesData }] =
    await Promise.all([
      supabase
        .from("tools")
        .select(
          "id, slug, name, primary_category, pricing_type, is_featured, is_verified, status, published_at"
        )
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("categories").select("slug, name"),
    ]);

  if (toolsError) {
    console.error("[admin/tools] fetch failed:", toolsError);
  }

  type Row = Pick<
    Tool,
    | "id"
    | "slug"
    | "name"
    | "primary_category"
    | "pricing_type"
    | "is_featured"
    | "is_verified"
    | "status"
    | "published_at"
  >;

  const tools = (toolsData ?? []) as Row[];
  const categoriesBySlug: Record<string, string> = {};
  for (const c of (categoriesData ?? []) as Pick<Category, "slug" | "name">[]) {
    categoriesBySlug[c.slug] = c.name;
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Library
        </p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Tools
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          {tools.length === 0
            ? "No tools yet. Approve submissions to populate this list."
            : `${tools.length} tools. Promote to featured, verify, or unpublish.`}
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        {tools.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-muted-foreground">
              <Wrench className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium">No tools yet</p>
            <p className="text-xs text-muted-foreground">
              Approve submissions to populate this list.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-secondary/30 hover:bg-secondary/30">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow
                  key={tool.id}
                  className="border-b border-border/40 transition-colors hover:bg-secondary/20"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <Link
                        href={`/tools/${tool.slug}`}
                        className="font-medium text-foreground transition-colors hover:text-accent"
                      >
                        {tool.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">
                        /{tool.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {categoriesBySlug[tool.primary_category] ??
                        tool.primary_category}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tool.pricing_type ? (
                      <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                        {tool.pricing_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tool.status} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {tool.published_at ? formatDate(tool.published_at) : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminToolRowActions
                      toolId={tool.id}
                      initialFeatured={tool.is_featured}
                      initialVerified={tool.is_verified}
                      initialStatus={tool.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
        Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Pending
    </span>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}