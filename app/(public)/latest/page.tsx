import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Pause, Clock } from "lucide-react";
import { pageMetadata } from "@/lib/seo/metadata";
import { getPublicTools } from "@/features/catalog/server";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Latest AI Tools — View Unavailable",
    description:
      "The latest AI tools view is currently unavailable. Browse the full AIKnows directory by category or task, or suggest a new tool for review.",
    path: "/latest",
    noIndex: true,
  }),
  robots: { index: false, follow: false },
};

export default async function LatestPage() {
  const tools = await getPublicTools();

  return (
    <div className="mx-auto w-full max-w-[768px] px-5 py-12 sm:px-8 md:py-20">
      <p className="mb-3 text-sm font-medium text-accent">Latest / Paused</p>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-9">
        <h1 className="text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          The &ldquo;Latest&rdquo; view is temporarily paused.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Publication dates are incomplete, so this view is currently
          unavailable. You can still browse the full directory by category or
          search for a product and task.
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 text-sm">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Status
            </dt>
            <dd className="mt-1 inline-flex items-center gap-1.5 text-foreground">
              <Pause className="h-3.5 w-3.5 text-accent" />
              Currently unavailable
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Indexed records
            </dt>
            <dd className="mt-1 text-foreground">
              <span className="tabular-nums">
                {String(tools.length).padStart(4, "0")}
              </span>{" "}
              tools currently in the public catalog
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              Explore instead
            </dt>
            <dd className="mt-1 text-foreground">
              Browse categories and related tools to find products for your
              workflow.
            </dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/tools" className="action-primary">
            <ArrowLeft className="h-3.5 w-3.5" />
            Browse AI tools
          </Link>
          <Link href="/submit" className="action-secondary">
            <Clock className="h-3.5 w-3.5" />
            Submit a tool for editorial review
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        New tool suggestions can be shared through our public submission
        channel.
      </p>
    </div>
  );
}
