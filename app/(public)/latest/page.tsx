import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pause, Clock } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { getPublicTools } from "@/features/catalog/server";

export const metadata: Metadata = {
  title: "Latest — paused",
  description:
    "This view is temporarily paused. We only publish a 'Latest' ordering once recorded publication dates reflect editorial review, not batch import.",
  alternates: { canonical: `${siteUrl}/latest` },
  robots: { index: false, follow: false },
};

export default async function LatestPage() {
  const tools = await getPublicTools();

  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-20">
      <p className="mb-3 text-sm font-medium text-accent">
        Latest / Paused
      </p>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-9">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          The &ldquo;Latest&rdquo; view is temporarily paused.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
          A genuine &ldquo;Latest&rdquo; view needs recorded publication dates that reflect editorial review &mdash; not batch seed import time. Until those dates have a documented meaning, showing a fabricated ordering here would imply freshness we can&apos;t substantiate.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Status</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground">
              <Pause className="h-3.5 w-3.5 text-accent" />
              Unavailable &mdash; methodology not yet published
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Indexed records</dt>
            <dd className="mt-1 text-foreground">
              <span className="tabular-nums">{String(tools.length).padStart(4, "0")}</span>{" "}
              tools currently in the public catalog
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">Why no fallback list</dt>
            <dd className="mt-1 text-foreground">
              We won&apos;t substitute the full catalog and call it a fresh list. That would misread as editorial recency.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools" className="action-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the tool index
          </Link>
          <Link href="/submit" className="action-secondary">
            <Clock className="h-3.5 w-3.5" />
            Submit a tool for editorial review
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        We&apos;ll restore this view as soon as publication dates and the supporting editorial workflow are documented in the public changelog.
      </p>
    </div>
  );
}
