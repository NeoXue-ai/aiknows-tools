import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { pricingLabel } from "@/lib/tool-score";
import { categoryName } from "@/lib/seo/tool-schema";
import type { Tool } from "@/lib/supabase/types";

function ToolRowThumb({ name, screenshotUrl, logoUrl }: { name: string; screenshotUrl?: string | null; logoUrl?: string | null }) {
  if (screenshotUrl) {
    return (
      <div className="relative h-14 w-20 shrink-0 overflow-hidden border border-border bg-muted sm:h-16 sm:w-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshotUrl} alt={`${name} screenshot`} loading="lazy" className="h-full w-full object-cover object-top" />
      </div>
    );
  }

  if (logoUrl) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden border border-border bg-card sm:h-16 sm:w-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={`${name} logo`} className="h-full w-full object-contain p-1.5" />
      </div>
    );
  }

  const letter = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center bg-secondary font-mono text-base text-foreground sm:h-16 sm:w-16">
      {letter}
    </div>
  );
}

export function ToolListView({ tools }: { tools: Tool[] }) {
  return (
    <ul className="border-y border-border">
      {tools.map((tool) => {
        const pricing = pricingLabel(tool.pricing_type);
        return (
          <li key={tool.id || tool.slug} className="group relative flex gap-3 border-b border-border py-4 last:border-b-0 hover:bg-secondary/40">
            <ToolRowThumb name={tool.name} screenshotUrl={tool.screenshot_url} logoUrl={tool.logo_url} />

            <div className="min-w-0 flex-1 pr-12">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-accent">
                      {tool.name}
                    </span>
                    {typeof tool.dr === "number" && (
                      <span
                        className="shrink-0 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-foreground"
                        title={`Domain Rating ${tool.dr}`}
                      >
                        DR {tool.dr}
                      </span>
                    )}
                  </div>
                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {tool.tagline ?? tool.description ?? "Description not recorded."}
                  </span>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                <span>{categoryName(tool.primary_category)}</span>
                <span aria-hidden>·</span>
                <span>{pricing === "—" ? "Pricing not recorded" : pricing}</span>
                <span aria-hidden>·</span>
                <span>{tool.pricing_detail ? "price detail recorded" : "price detail not recorded"}</span>
                <span aria-hidden>·</span>
                <span>{tool.source ? "source recorded" : "source not recorded"}</span>
              </div>
            </div>

            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${tool.name} website`}
              className="relative z-10 hidden shrink-0 self-center text-muted-foreground transition-colors hover:text-accent sm:inline-flex"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <Link
              href={`/tools/${tool.slug}`}
              aria-label={`Open ${tool.name} detail page`}
              className="absolute inset-0 z-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </li>
        );
      })}
    </ul>
  );
}