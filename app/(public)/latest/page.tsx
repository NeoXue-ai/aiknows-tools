import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pause, Clock } from "lucide-react";
import { siteUrl } from "@/lib/site";
import { buttonVariants } from "@/components/ui/button-variants";
import { getPublicTools } from "@/lib/public-catalog";
import { cn } from "@/lib/utils";

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
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
        Latest / Paused
      </p>

      <div className="border-y border-border py-10">
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          The &ldquo;Latest&rdquo; view is temporarily paused.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
          A genuine &ldquo;Latest&rdquo; view needs recorded publication dates that reflect editorial review &mdash; not batch seed import time. Until those dates have a documented meaning, showing a fabricated ordering here would imply freshness we can&apos;t substantiate.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Status</dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground">
              <Pause className="h-3.5 w-3.5 text-accent" />
              Unavailable &mdash; methodology not yet published
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Indexed records</dt>
            <dd className="mt-1 text-foreground">
              <span className="font-mono tabular-nums">{String(tools.length).padStart(4, "0")}</span>{" "}
              tools currently in the public catalog
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Why no fallback list</dt>
            <dd className="mt-1 text-foreground">
              We won&apos;t substitute the full catalog and call it a fresh list. That would misread as editorial recency.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to the tool index
          </Link>
          <Link href="/submit" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}>
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
