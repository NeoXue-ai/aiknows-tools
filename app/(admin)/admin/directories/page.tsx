import Link from "next/link";
import { FolderTree } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <div className="space-y-8">
      <header>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          Database
        </p>
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
          Directories
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          {directories.length === 0
            ? "No directories yet."
            : `${directories.length} directories. Mark dead links to keep the database clean.`}
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
        {directories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-secondary/40 text-muted-foreground">
              <FolderTree className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium">No directories yet</p>
            <p className="text-xs text-muted-foreground">
              Run a sync to populate this list.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-secondary/30 hover:bg-secondary/30">
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
                <TableRow
                  key={dir.id}
                  className="border-b border-border/40 transition-colors hover:bg-secondary/20"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        {dir.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {dir.dr !== null && dir.dr !== undefined ? (
                      <span className="font-mono text-sm font-medium tabular-nums text-foreground/90">
                        {dir.dr}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {dir.submission_type ? (
                      <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                        {dir.submission_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {dir.link_type ? (
                      <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-foreground/90">
                        {dir.link_type}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DirectoryStatusBadge status={dir.status} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-muted-foreground">
                      {dir.last_checked ? formatDate(dir.last_checked) : "—"}
                    </span>
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
      </div>
    </div>
  );
}

function DirectoryStatusBadge({ status }: { status: string }) {
  if (status === "active")
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        Active
      </span>
    );
  if (status === "dead")
    return (
      <span className="inline-flex items-center rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
        Dead
      </span>
    );
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Unknown
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