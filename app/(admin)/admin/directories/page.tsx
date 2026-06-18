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
import { AdminDirectoryRowActions } from "@/components/AdminDirectoryRowActions";
import type { Directory } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Directories | Admin" };

export default async function AdminDirectoriesPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("directories")
    .select(
      "id, slug, name, dr, submission_type, link_type, status, last_checked"
    )
    .order("dr", { ascending: false, nullsFirst: false })
    .limit(500);

  if (error) {
    console.error("[admin/directories] fetch failed:", error);
  }

  type Row = Pick<
    Directory,
    | "id"
    | "slug"
    | "name"
    | "dr"
    | "submission_type"
    | "link_type"
    | "status"
    | "last_checked"
  >;

  const directories = (data ?? []) as Row[];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Directories</h1>
        <p className="text-muted-foreground">
          {directories.length === 0
            ? "No directories yet."
            : `${directories.length} directories. Mark dead links to keep the database clean.`}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>All directories</CardTitle>
        </CardHeader>
        <CardContent>
          {directories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No directories yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>DR</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Link type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directories.map((dir) => (
                  <TableRow key={dir.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <Link
                          href={`/directories/${dir.slug}`}
                          className="font-medium hover:underline"
                        >
                          {dir.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{dir.dr ?? "—"}</TableCell>
                    <TableCell>
                      {dir.submission_type ? (
                        <Badge variant="outline">{dir.submission_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {dir.link_type ? (
                        <Badge variant="outline">{dir.link_type}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={dir.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dir.last_checked ? formatDate(dir.last_checked) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <AdminDirectoryRowActions
                        directoryId={dir.id}
                        initialStatus={dir.status}
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
  if (status === "active") return <Badge>Active</Badge>;
  if (status === "dead") return <Badge variant="destructive">Dead</Badge>;
  return <Badge variant="secondary">Unknown</Badge>;
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
