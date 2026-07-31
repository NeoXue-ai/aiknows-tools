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
      className="group flex items-baseline gap-3 py-2 transition-colors hover:text-foreground"
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
          className="scroll-mt-24 border-t border-border py-10 first:border-t-0 first:pt-0"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
            {String(idx).padStart(2, "0")} / {category.name}
          </p>
          <h2 className="mt-3 text-balance font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {category.name}
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
                    className="group inline-flex items-baseline gap-2 rounded-md border border-border px-3 py-1.5 transition-colors hover:border-accent/40"
                  >
                    <span className="font-mono text-[11px] text-foreground/90 transition-colors group-hover:text-accent">
                      {sub.name}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                      {String(sub.count).padStart(2, "0")}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-y border-border py-4">
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Records
              </dt>
              <dd className="mt-1 font-mono tabular-nums text-foreground">
                {String(coverage.total).padStart(4, "0")}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Pricing detail
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {coverage.withPricingDetail} of {coverage.total} recorded
                <span className="ml-1 text-muted-foreground">
                  ({fmtPct(coverage.withPricingDetail, coverage.total)})
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Source
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {coverage.withSource} of {coverage.total} recorded
                <span className="ml-1 text-muted-foreground">
                  ({fmtPct(coverage.withSource, coverage.total)})
                </span>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Verification
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {coverage.withVerification} of {coverage.total} recorded
                <span className="ml-1 text-muted-foreground">
                  ({fmtPct(coverage.withVerification, coverage.total)})
                </span>
              </dd>
            </div>
          </dl>

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

          <div className="mt-6 flex justify-end">
            <Link
              href={`/categories/${category.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-accent"
            >
              View all {coverage.total} record{coverage.total === 1 ? "" : "s"} in {category.name}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      ))}
    </div>
  );
}