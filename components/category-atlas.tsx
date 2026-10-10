import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SubGridReveal } from "@/components/sub-grid-reveal";
import { categoryIcon } from "@/lib/category-icons";
import type { Category } from "@/features/catalog/types";

export type CategorySection = {
  category: Category;
  toolCount: number;
  subs: { slug: string; name: string; count: number }[];
};

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
      {sections.map(({ category, subs }, idx) => {
        const Icon = categoryIcon(category.slug);
        return (
          <section
            key={category.slug}
            id={`cat-${category.slug}`}
            className="scroll-mt-24 border-t border-border py-16 first:border-t-0 first:pt-0"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              {String(idx).padStart(2, "0")}
            </p>
            <h2 className="mt-4">
              <Link
                href={`/categories/${category.slug}`}
                className="inline-flex items-center gap-2.5 text-balance font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-accent sm:text-3xl"
              >
                <Icon className="h-5 w-5 shrink-0 text-accent" />
                {category.name}
              </Link>
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
              {category.description ?? "Description not recorded."}
            </p>

            {subs.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Sub-categories
                </p>
                <SubGridReveal className="mt-5 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                  {subs.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/categories/${sub.slug}`}
                      className="group flex min-w-0 items-baseline justify-between gap-3 transition-transform duration-200 hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
                    >
                      <span className="truncate text-base text-foreground transition-colors group-hover:text-accent">
                        {sub.name}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1.5">
                        <span className="font-mono text-sm tabular-nums text-muted-foreground">
                          {sub.count}
                        </span>
                        <ArrowRight className="h-4 w-4 translate-x-1 text-accent opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100" />
                      </span>
                    </Link>
                  ))}
                </SubGridReveal>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
