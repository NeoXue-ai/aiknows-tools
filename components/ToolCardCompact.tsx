import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ToolLogo } from "@/components/tool-logo";
import { pricingLabel } from "@/lib/tool-score";
import { categoryName } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

const PRICING_DOT: Record<string, string> = {
  Free: "bg-emerald-500",
  Freemium: "bg-amber-500",
  Paid: "bg-accent",
  Enterprise: "bg-violet-500",
};

/**
 * Compact tool card used in the homepage trending strip.
 * Records only what fits a scannable grid: identity, tagline, category, pricing.
 */
export function ToolCardCompact({ tool }: { tool: Tool }) {
  const pricing = pricingLabel(tool.pricing_type);

  return (
    <div className="group/row relative h-full overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40">
      <div className="flex items-start gap-3">
        <ToolLogo name={tool.name} logoUrl={tool.logo_url} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-medium text-foreground">
            {tool.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
            {tool.tagline ?? tool.description ?? "AI tool in the aiknows directory."}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-mono uppercase tracking-[0.08em] text-foreground/70">
            {categoryName(tool.primary_category)}
          </span>
          {pricing !== "—" && (
            <>
              <span aria-hidden className="text-border">·</span>
              <span className="inline-flex items-center gap-1">
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    PRICING_DOT[pricing] ?? "bg-muted-foreground",
                  )}
                />
                {pricing}
              </span>
            </>
          )}
        </div>
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-accent"
          aria-label={`Visit ${tool.name}`}
        >
          Visit
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5" />
        </a>
      </div>

      <Link
        href={`/tools/${tool.slug}`}
        aria-label={`Open ${tool.name} detail page`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </div>
  );
}