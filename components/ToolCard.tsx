import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ToolLogo } from "@/components/tool-logo";
import { categoryName } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";
import type { ToolSummary } from "@/features/catalog/types";

const R2_HOST = "pub-459c6f6553344cc393826444731f5707.r2.dev";

export function ToolCard({
  tool,
  compact = false,
  image,
  badge,
}: {
  tool: ToolSummary;
  compact?: boolean;
  image?: string;
  badge?: string;
}) {
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  const screenshotSrc = image ?? tool.screenshot_url;
  const isR2Screenshot = screenshotSrc?.includes(R2_HOST) ?? false;

  return (
    <Card className="group/card relative h-full gap-0 overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-none transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-[0_12px_32px_-20px_rgb(32_39_34/0.22)]">
      <div className={cn("relative w-full overflow-hidden rounded-xl border border-border/60 bg-secondary", compact ? "aspect-[16/9]" : "aspect-[16/10]")}>
        {badge && (
          <span className="absolute left-3 top-3 z-20 rounded-full border border-border/60 bg-card/95 px-2.5 py-1 text-[11px] font-medium text-accent backdrop-blur">
            {badge}
          </span>
        )}
        {screenshotSrc ? (
          isR2Screenshot ? (
            <Image
              src={screenshotSrc}
              alt={`${tool.name} screenshot`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-300 group-hover/card:scale-[1.02]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotSrc}
              alt={`${tool.name} screenshot`}
              loading="lazy"
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover/card:scale-[1.02]"
            />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary text-accent">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/10 bg-card text-2xl font-semibold">
              {tool.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs text-muted-foreground">Preview unavailable</span>
          </div>
        )}

        {/* DR — top-right overlay */}
        {typeof tool.dr === "number" && (
          <span
            className="absolute right-3 top-3 rounded-full border border-border/60 bg-card/95 px-2.5 py-1 text-[11px] font-medium tabular-nums text-foreground backdrop-blur"
            title={`Domain Rating ${tool.dr}`}
          >
            DR {tool.dr}
          </span>
        )}
      </div>

      <div className={cn("relative flex flex-1 flex-col", compact ? "gap-3 px-2 pb-2 pt-4" : "gap-4 px-2 pb-2 pt-5")}>
        <div className="flex items-start gap-3">
          <ToolLogo name={tool.name} logoUrl={tool.logo_url} size="md" />
          <div className="min-w-0 flex-1">
            <h3 className={cn("truncate font-semibold leading-tight tracking-[-0.01em] text-foreground", compact ? "text-[15px]" : "text-base")}>
              {tool.name}
            </h3>
            {domain && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {domain}
              </p>
            )}
          </div>
        </div>

        <p className={cn("line-clamp-2 text-muted-foreground", compact ? "text-[13px] leading-6" : "text-sm leading-6")}>
          {tool.tagline ?? "Description not recorded."}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/70 pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="text-muted-foreground">
              {categoryName(tool.primary_category)}
            </span>
          </div>
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${tool.name} website`}
            className="relative z-20 inline-flex min-h-8 items-center gap-1 rounded-lg px-2 text-xs font-medium text-accent transition-colors hover:bg-accent/8"
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
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      />
    </Card>
  );
}
