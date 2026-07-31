"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTick } from "@/lib/motion";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  Directory,
  LinkType,
  SubmissionType,
} from "@/lib/supabase/types";

type SortKey =
  | "name"
  | "dr"
  | "submission_type"
  | "paid_price"
  | "link_type"
  | "listing_speed"
  | "last_checked";
type SortDir = "asc" | "desc";

const MIN_DR_OPTIONS: Array<{ label: string; value: number }> = [
  { label: "All", value: 0 },
  { label: "DR 20+", value: 20 },
  { label: "DR 40+", value: 40 },
  { label: "DR 60+", value: 60 },
  { label: "DR 80+", value: 80 },
];

function relativeTime(iso: string | null): string {
  if (!iso) return "Not recorded";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "Not recorded";
  const diffMs = Date.now() - then;
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo ago`;
  const year = Math.floor(day / 365);
  return `${year}y ago`;
}

function drDisplay(dr: number | null): { label: string; className: string; barClass: string } {
  if (dr == null) {
    return {
      label: "Not recorded",
      className: "text-muted-foreground",
      barClass: "bg-border",
    };
  }
  return {
    label: String(dr),
    className: "text-foreground",
    barClass: "bg-foreground/60",
  };
}

function submissionBadge(t: SubmissionType | null): { label: string; className: string } {
  if (t === "free") return { label: "Free", className: "border-border text-foreground" };
  if (t === "paid") return { label: "Paid", className: "border-border text-foreground" };
  if (t === "both") return { label: "Free + Paid", className: "border-border text-foreground" };
  return { label: "Not recorded", className: "border-border text-muted-foreground" };
}

function linkTypeBadge(t: LinkType | null): { label: string; className: string } {
  if (t === "dofollow") return { label: "dofollow", className: "border-border text-foreground" };
  if (t === "nofollow") return { label: "nofollow", className: "border-border text-foreground" };
  return { label: "Not recorded", className: "border-border text-muted-foreground" };
}

export function DirectoryTable({ directories }: { directories: Directory[] }) {
  const [search, setSearch] = React.useState("");
  const [submission, setSubmission] = React.useState<
    "all" | SubmissionType
  >("all");
  const [linkType, setLinkType] = React.useState<"all" | LinkType>("all");
  const [minDr, setMinDr] = React.useState<number>(0);
  const [sortKey, setSortKey] = React.useState<SortKey>("dr");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");
  // Force re-render every 60s so relative times stay current.
  useTick(60_000);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return directories.filter((d) => {
      if (submission !== "all" && d.submission_type !== submission) return false;
      if (linkType !== "all" && d.link_type !== linkType) return false;
      if (minDr > 0 && (d.dr == null || d.dr < minDr)) return false;
      if (q) {
        const hay = `${d.name} ${d.niche_focus ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [directories, search, submission, linkType, minDr]);

  const sorted = React.useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "dr":
          return ((a.dr ?? -1) - (b.dr ?? -1)) * dir;
        case "submission_type":
          return (
            (a.submission_type ?? "").localeCompare(b.submission_type ?? "") *
            dir
          );
        case "paid_price":
          return (
            (a.paid_price ?? "").localeCompare(b.paid_price ?? "") * dir
          );
        case "link_type":
          return ((a.link_type ?? "").localeCompare(b.link_type ?? "")) * dir;
        case "listing_speed":
          return (
            (a.listing_speed ?? "").localeCompare(b.listing_speed ?? "") * dir
          );
        case "last_checked":
          return (
            (new Date(a.last_checked ?? 0).getTime() -
              new Date(b.last_checked ?? 0).getTime()) *
            dir
          );
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function resetFilters() {
    setSearch("");
    setSubmission("all");
    setLinkType("all");
    setMinDr(0);
  }

  const filtersActive =
    search.length > 0 ||
    submission !== "all" ||
    linkType !== "all" ||
    minDr > 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="border-y border-border py-4">
        <div className="space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or niche…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 border-border pl-9"
            />
          </div>

          <FilterRow
            label="Submit"
            options={[
              { label: "All", value: "all" },
              { label: "Free", value: "free" },
              { label: "Paid", value: "paid" },
              { label: "Both", value: "both" },
            ]}
            value={submission}
            onChange={(v) => setSubmission(v as typeof submission)}
          />

          <FilterRow
            label="Link"
            options={[
              { label: "All", value: "all" },
              { label: "Dofollow", value: "dofollow" },
              { label: "Nofollow", value: "nofollow" },
            ]}
            value={linkType}
            onChange={(v) => setLinkType(v as typeof linkType)}
          />

          <FilterRow
            label="Min DR"
            options={MIN_DR_OPTIONS.map((o) => ({
              label: o.label,
              value: String(o.value),
            }))}
            value={String(minDr)}
            onChange={(v) => setMinDr(Number(v))}
          />
        </div>
      </div>

      {/* Result count */}
      <div className="flex items-center justify-between px-1 text-sm">
        <p className="text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{sorted.length}</span>{" "}
          of{" "}
          <span className="font-medium text-foreground">
            {directories.length}
          </span>{" "}
          directories
        </p>
        {filtersActive ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border hover:bg-transparent">
              <SortableHead
                label="Name"
                sortKey="name"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
              />
              <SortableHead
                label="DR"
                sortKey="dr"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="w-28"
              />
              <SortableHead
                label="Type"
                sortKey="submission_type"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="w-32"
              />
              <SortableHead
                label="Price"
                sortKey="paid_price"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden w-28 md:table-cell"
              />
              <SortableHead
                label="Link"
                sortKey="link_type"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="w-28"
              />
              <SortableHead
                label="Speed"
                sortKey="listing_speed"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden w-32 md:table-cell"
              />
              <TableHead className="w-24">Submit</TableHead>
              <SortableHead
                label="Last Checked"
                sortKey="last_checked"
                current={sortKey}
                dir={sortDir}
                onSort={toggleSort}
                className="hidden w-32 md:table-cell"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border/60 bg-secondary/40 text-muted-foreground">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        No directories match your filters.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try widening the DR tier or clearing search.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className={cn(
                        buttonVariants({ size: "sm", variant: "outline" }),
                      )}
                    >
                      Clear filters
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((d) => <DirectoryRow key={d.id} directory={d} />)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                active
                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_0_1px_var(--accent)]"
                  : "border-border bg-background/60 text-muted-foreground hover:border-accent/40 hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SortableHead({
  label,
  sortKey,
  current,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = current === sortKey;
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.18em] transition-colors hover:text-foreground",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </TableHead>
  );
}

function DirectoryRow({ directory }: { directory: Directory }) {
  const dr = drDisplay(directory.dr);
  const lt = linkTypeBadge(directory.link_type);
  const st = submissionBadge(directory.submission_type);
  const submitLabel =
    directory.submission_type === "paid"
      ? directory.paid_price
        ? `Submit (${directory.paid_price})`
        : "Submit (Paid)"
      : directory.submission_type === "both" && directory.paid_price
        ? `Submit (${directory.paid_price})`
        : "Submit";

  return (
    <TableRow className="border-b border-border/40 transition-colors hover:bg-secondary/30">
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <a
            href={directory.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-accent"
          >
            {directory.name}
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
          {directory.niche_focus ? (
            <span className="text-xs text-muted-foreground">
              {directory.niche_focus}
            </span>
          ) : null}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-semibold tabular-nums",
              dr.className,
            )}
          >
            {dr.label}
          </span>
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <div
              className={cn("ml-bar h-full", dr.barClass)}
              style={{
                width: `${Math.max(0, Math.min(100, directory.dr ?? 0))}%`,
              }}
            />
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            st.className,
          )}
        >
          {st.label}
        </span>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <span className="font-mono text-xs text-muted-foreground">
          {directory.paid_price ?? "—"}
        </span>
      </TableCell>

      <TableCell>
        <span
          className={cn(
            "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
            lt.className,
          )}
        >
          {lt.label}
        </span>
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <span className="text-xs text-muted-foreground">
          {directory.listing_speed ?? "—"}
        </span>
      </TableCell>

      <TableCell>
        {directory.submit_url ? (
          <a
            href={directory.submit_url}
            target="_blank"
            rel="noopener noreferrer"
            title={
              directory.submission_type === "paid" && directory.paid_price
                ? `Paid: ${directory.paid_price}`
                : undefined
            }
            className={cn(
              buttonVariants({ size: "xs", variant: "outline" }),
              "transition-colors hover:border-accent/40 hover:text-accent",
            )}
          >
            {submitLabel}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell className="hidden md:table-cell">
        <span
          className="font-mono text-xs text-muted-foreground"
          title={directory.last_checked ?? undefined}
        >
          {relativeTime(directory.last_checked)}
        </span>
      </TableCell>
    </TableRow>
  );
}