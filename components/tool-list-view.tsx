import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryName } from "@/lib/seo/tool-schema";
import type { ToolSummary } from "@/features/catalog/types";

function ToolRowThumb({ name, screenshotUrl, logoUrl }: { name: string; screenshotUrl?: string | null; logoUrl?: string | null }) {
  if (screenshotUrl) {
    return (
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-border bg-secondary p-1 sm:h-20 sm:w-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotUrl} alt={`${name} screenshot`} loading="lazy" className="h-full w-full rounded-lg object-cover object-top" />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-card sm:h-20 sm:w-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain p-1.5" />
      </div>
    );
  }

  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div aria-hidden className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-accent/10 bg-accent/8 text-lg font-semibold text-accent sm:h-20 sm:w-20">
      {letter}
    </div>
  );
}

export function ToolListView({ tools }: { tools: ToolSummary[] }) {
  return (
    <ul className="overflow-hidden rounded-2xl border border-border bg-card">
      {tools.map((tool) => (
        <li key={tool.slug} className="group relative flex items-center gap-4 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-secondary/40 sm:gap-5 sm:p-5">
          <ToolRowThumb name={tool.name} screenshotUrl={tool.screenshot_url} logoUrl={tool.logo_url} />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="block truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground group-hover:text-accent">
                    {tool.name}
                  </span>
                  {typeof tool.dr === "number" && (
                    <span
                      className="shrink-0 rounded-full border border-border bg-card px-2 py-0.5 text-[11px] font-medium tabular-nums text-muted-foreground"
                      title={`Domain Rating ${tool.dr}`}
                    >
                      DR {tool.dr}
                    </span>
                  )}
                </div>
                <span className="mt-1.5 block line-clamp-2 text-[13px] leading-6 text-muted-foreground">
                  {tool.tagline ?? "Description not recorded."}
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{categoryName(tool.primary_category)}</span>
              {tool.pricing_detail && (
                <>
                  <span aria-hidden>·</span>
                  <span>Pricing details available</span>
                </>
              )}
              {tool.source && (
                <>
                  <span aria-hidden>·</span>
                  <span>Source available</span>
                </>
              )}
            </div>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${tool.name} website`}
            className="relative z-20 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/30 hover:bg-accent/8 hover:text-accent"
          >
            <ArrowUpRight className="h-4 w-4" />
          </a>

          <Link
            href={`/tools/${tool.slug}`}
            aria-label={`Open ${tool.name} detail page`}
            className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
          />
        </li>
      ))}
    </ul>
  );
}
