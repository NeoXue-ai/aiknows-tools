import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pricingLabel } from "@/lib/tool-score";
import type { CategoryCoverage } from "@/lib/public-catalog";
import type { Category, Tool } from "@/lib/supabase/types";

export type CategorySection = {
  category: Category;
  coverage: CategoryCoverage;
  previewTools: Tool[];
  subs: { slug: string; name: string; count: number }[];
};

function fmtPct(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function PreviewRow({ tool, index }: { tool: Tool; index: number }) {
  const pricing = pricingLabel(tool.pricing_type);
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex items-baseline gap-3 py-2.5 transition-colors hover:text-foreground"
    >
      <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm text-foreground/90 group-hover:text-accent">
        {tool.name}
      </span>
      <span className="hidden shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground sm:inline">
        {typeof tool.dr === "number" ? `DR ${tool.dr}` : "DR —"}
      </span>
      <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground sm:inline">
        {pricing === "—" ? "Pricing not recorded" : pricing}
      </span>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
    </Link>
  );
}

export function CategoryAtlas({ sections }: { sections: CategorySection[] }) {
  if (sections.length === 0) {
    return (
      <p className="border-y border-border py-10 text-sm text-muted-foreground">
        No categories have recorded entries yet. Add tools through the editorial workflow to fill this index.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {sections.map(({ category, coverage, previewTools, subs }, idx) => (
        <section
          key={category.slug}
          id={`cat-${category.slug}`}
          className="scroll-mt-24 border-t border-border py-12 first:border-t-0 first:pt-0"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            {String(idx).padStart(2, "0")}
          </p>
          <h2 className="mt-3">
            <Link
              href={`/categories/${category.slug}`}
              className="text-balance font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-accent sm:text-3xl"
            >
              {category.name}
            </Link>
          </h2>
          <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
            {category.description ?? "Description not recorded."}
          </p>

          {subs.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Sub-categories
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {subs.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/categories/${sub.slug}`}
                    className="inline-flex items-baseline gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-accent"
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/60">
                      {String(sub.count).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 font-mono text-[11px] tabular-nums text-muted-foreground">
            {`${String(coverage.total).padStart(4, "0")} record${coverage.total === 1 ? "" : "s"} · pricing ${fmtPct(coverage.withPricingDetail, coverage.total)} · source ${fmtPct(coverage.withSource, coverage.total)} · verification ${fmtPct(coverage.withVerification, coverage.total)}`}
          </p>

          {previewTools.length > 0 ? (
            <div className="mt-4 divide-y divide-border border-b border-border">
              {previewTools.map((tool, i) => (
                <PreviewRow key={tool.slug} tool={tool} index={i} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              No records yet for this category.
            </p>
          )}

        </section>
      ))}
    </div>
  );
}