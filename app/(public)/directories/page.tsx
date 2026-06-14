import Link from "next/link";
import type { Metadata } from "next";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ArrowRight, Filter, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { DirectoryTable } from "@/components/DirectoryTable";
import {
  directoryItemListJsonLd,
  directoryPageMetadata,
} from "@/lib/seo/directory-schema";
import type { Directory } from "@/lib/supabase/types";

export const dynamic = "force-static";

export const metadata: Metadata = directoryPageMetadata();

async function loadDirectories(): Promise<Directory[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      const supabase = await createClient();
      const { data: rows } = await supabase
        .from("directories")
        .select("*")
        .eq("status", "active")
        .order("dr", { ascending: false, nullsFirst: false });
      if (rows && rows.length > 0) return rows as Directory[];
    } catch {
      // fall through to JSON fallback (build-time without Supabase)
    }
  }
  const raw = await readFile(
    resolve(process.cwd(), "data/directories.json"),
    "utf8",
  );
  return JSON.parse(raw) as Directory[];
}

export default async function DirectoriesPage() {
  const directories = await loadDirectories();
  const total = directories.length;
  const drValues = directories
    .map((d) => d.dr)
    .filter((v): v is number => typeof v === "number");
  const avgDr = drValues.length
    ? Math.round(drValues.reduce((sum, v) => sum + v, 0) / drValues.length)
    : 0;
  const dofollowCount = directories.filter(
    (d) => d.link_type === "dofollow",
  ).length;
  const freeCount = directories.filter((d) => d.submission_type === "free")
    .length;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = directoryItemListJsonLd(directories, siteUrl);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Updated weekly
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Best AI Directories to Submit Your SaaS
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
          {total}+ curated directories for AI and SaaS builders. Filter by Domain
          Rating, link type, submission type, and listing speed — all in one
          sortable table.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <Stat label="directories" value={`${total}+`} />
          <Divider />
          <Stat
            label="avg DR"
            value={avgDr > 0 ? String(avgDr) : "—"}
          />
          <Divider />
          <Stat label="dofollow" value={String(dofollowCount)} />
          <Divider />
          <Stat label="free to submit" value={String(freeCount)} />
        </div>
      </section>

      <section className="mb-10 grid gap-6 md:grid-cols-2">
        <HowToCard />
        <SuggestCard />
      </section>

      <section className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          All Directories
        </h2>
      </section>

      <DirectoryTable directories={directories} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-xl font-semibold tracking-tight text-foreground">
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function Divider() {
  return (
    <span aria-hidden className="h-4 w-px bg-border" />
  );
}

function HowToCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-2 text-base font-semibold">How to use this table</h3>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            <span className="font-medium text-foreground">Sort</span> by any
            column header — DR or speed is usually the fastest win.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            <span className="font-medium text-foreground">Filter</span> by DR
            tier, link type, or submission type to fit your launch budget.
          </span>
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>
            <span className="font-medium text-foreground">Search</span> by
            directory name or niche to find verticals (e.g. &ldquo;AI image&rdquo;,
            &ldquo;dev tools&rdquo;).
          </span>
        </li>
      </ul>
    </div>
  );
}

function SuggestCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-2 text-base font-semibold">Missing a directory?</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Know a high-DR directory that should be on this list? Suggest it and
        we&apos;ll verify and add it within the week.
      </p>
      <Link
        href="/submit"
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Suggest a directory <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
      </Link>
    </div>
  );
}