import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminToolRowActions } from "@/components/AdminToolRowActions";
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
        <p className="text-muted-foreground">
          {tools.length === 0
            ? "No tools yet. Approve submissions to populate this list."
            : `${tools.length} tools. Promote to featured, verify, or unpublish.`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All tools</CardTitle>
        </CardHeader>
        <CardContent>
          {tools.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tools yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                  <TableRow key={tool.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="font-medium hover:underline"
                        >
                          {tool.name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          /{tool.slug}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {categoriesBySlug[tool.primary_category] ??
                        tool.primary_category}
                    </TableCell>
                    <TableCell>
                      {tool.pricing_type ? (
                        <Badge variant="outline">{tool.pricing_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tool.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {tool.published_at ? formatDate(tool.published_at) : "—"}
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
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
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
