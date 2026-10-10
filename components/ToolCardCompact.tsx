import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ToolLogo } from "@/components/tool-logo";
import { categoryName } from "@/lib/seo/tool-schema";
import type { ToolSummary } from "@/features/catalog/types";

/**
 * Compact tool card used in the homepage trending strip.
 * Records only what fits a scannable grid: identity, tagline, category.
 */
export function ToolCardCompact({ tool }: { tool: ToolSummary }) {
  return (
    <div className="group/row relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-accent/30 hover:shadow-[0_10px_28px_-20px_rgb(32_39_34/0.2)]">
      <div className="flex items-start gap-3">
        <ToolLogo name={tool.name} logoUrl={tool.logo_url} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold tracking-[-0.01em] text-foreground">
            {tool.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
            {tool.tagline ?? "AI tool in the aiknows directory."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {categoryName(tool.primary_category)}
          </span>
        </div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/8"
          aria-label={`Visit ${tool.name}`}
        >
          Visit
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5" />
        </a>
      </div>

      <Link
        href={`/tools/${tool.slug}`}
        aria-label={`Open ${tool.name} detail page`}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}
