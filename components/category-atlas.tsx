import Link from "next/link";
import { categoryIcon } from "@/lib/category-icons";
import type { Category } from "@/lib/supabase/types";

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
        const maxCount = Math.max(...subs.map((s) => s.count), 1);
        return (
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
                className="inline-flex items-center gap-2.5 text-balance font-heading text-2xl font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-accent sm:text-3xl"
              >
                <Icon className="h-5 w-5 shrink-0 text-accent" />
                {category.name}
              </Link>
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-sm leading-6 text-muted-foreground">
              {category.description ?? "Description not recorded."}
            </p>

            {subs.length > 0 && (
              <div className="mt-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  Sub-categories
                </p>
                <div className="mt-4 grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                  {subs.map((sub) => {
                    const pct =
                      sub.count === 0 ? 0 : Math.round((sub.count / maxCount) * 100);
                    return (
                      <Link
                        key={sub.slug}
                        href={`/categories/${sub.slug}`}
                        className="group block min-w-0"
                      >
                        <span className="flex items-baseline justify-between gap-3">
                          <span className="truncate text-sm text-foreground transition-colors group-hover:text-accent">
                            {sub.name}
                          </span>
                          <span className="font-mono text-xs tabular-nums text-muted-foreground">
                            {sub.count}
                          </span>
                        </span>
                        <span className="mt-2 block h-0.5 w-full overflow-hidden rounded-full bg-border/70">
                          <span
                            className="block h-full rounded-full bg-accent transition-[width] duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
