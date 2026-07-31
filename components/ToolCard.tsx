import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
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

export function ToolCard({ tool }: { tool: Tool }) {
  const pricing = pricingLabel(tool.pricing_type);
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  return (
    <Card className="group/card relative h-full overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40">
      {/* Screenshot — top of card */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
        {tool.screenshot_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.screenshot_url}
            alt={`${tool.name} screenshot`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover/card:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider text-muted-foreground/60">
            Screenshot not recorded
          </div>
        )}

        {/* DR badge — top-right overlay */}
        {typeof tool.dr === "number" && (
          <span
            className="absolute right-2 top-2 rounded-md border border-border/80 bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-foreground shadow-sm backdrop-blur"
            title={`Domain Rating ${tool.dr}`}
          >
            DR {tool.dr}
          </span>
        )}
      </div>

      {/* Identity + body */}
      <div className="relative space-y-3 p-4">
        <div className="flex items-start gap-3">
          <ToolLogo name={tool.name} logoUrl={tool.logo_url} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-heading text-base font-medium leading-tight text-foreground">
              {tool.name}
            </h3>
            {domain && (
              <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/70">
                {domain}
              </p>
            )}
          </div>
        </div>

        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {tool.tagline ?? tool.description ?? "Description not recorded."}
        </p>

        {/* Footer: category · pricing + visit CTA */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">
              {categoryName(tool.primary_category)}
            </span>
            {pricing !== "—" && (
              <>
                <span aria-hidden>·</span>
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
            rel="noopener noreferrer"
            className="relative z-20 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-accent"
          >
            Visit
            <ArrowUpRight className="h-3 w-3 transition-transform group-hover/card:translate-x-0.5 group-hover/card:-translate-y-0.5" />
          </a>
        </div>
      </div>

      {/* Invisible link covering the card for /tools/[slug] navigation */}
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={`Open ${tool.name} detail page`}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </Card>
  );
}