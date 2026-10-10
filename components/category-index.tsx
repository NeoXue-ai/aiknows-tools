import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryIcon } from "@/lib/category-icons";
import type { Category } from "@/features/catalog/types";

export type CategoryGroup = {
  category: Category;
  toolCount: number;
  subs: { slug: string; name: string; count: number }[];
};

export function CategoryIndex({ groups }: { groups: CategoryGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      {groups.map(({ category, toolCount, subs }) => {
        const Icon = categoryIcon(category.slug);
        return (
          <section key={category.slug} id={`cat-${category.slug}`} className="scroll-mt-24 rounded-2xl border border-border bg-card p-6 sm:p-7">
            <header className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/8 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold tracking-[-0.02em]">
                    <Link
                      href={`/categories/${category.slug}`}
                      className="group inline-flex items-center gap-2 text-foreground transition-colors hover:text-accent"
                    >
                      {category.name}
                    </Link>
                  </h2>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {toolCount} tools
                  </p>
                </div>
              </div>
              <Link href={`/categories/${category.slug}`} aria-label={`Browse ${category.name}`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent">
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </header>

            {category.description && <p className="mt-5 text-sm leading-6 text-muted-foreground">{category.description}</p>}

            {subs.length > 0 ? (
              <ul className="mt-6 grid grid-cols-1 gap-x-6 border-t border-border pt-3 sm:grid-cols-2">
                {subs.map((sub) => (
                  <li key={sub.slug} className="min-w-0">
                    <Link
                      href={`/categories/${sub.slug}`}
                      className="group flex items-baseline justify-between gap-3 rounded-lg py-2.5"
                    >
                      <span className="truncate text-[13px] text-foreground transition-colors group-hover:text-accent">
                        {sub.name}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground transition-colors group-hover:text-accent">
                        {sub.count}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 border-t border-border pt-4 text-sm text-muted-foreground">
                No sub-categories recorded yet.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
