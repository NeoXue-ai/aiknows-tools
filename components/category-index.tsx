import Link from "next/link";
import { categoryIcon } from "@/lib/category-icons";
import type { Category } from "@/lib/supabase/types";

export type CategoryGroup = {
  category: Category;
  toolCount: number;
  subs: { slug: string; name: string; count: number }[];
};

export function CategoryIndex({ groups }: { groups: CategoryGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-12">
      {groups.map(({ category, toolCount, subs }) => {
        const Icon = categoryIcon(category.slug);
        return (
        <section key={category.slug} id={`cat-${category.slug}`} className="scroll-mt-24">
          <header className="flex items-baseline justify-between gap-4 pb-3">
            <h2 className="text-xl font-semibold tracking-[-0.01em]">
              <Link
                href={`/categories/${category.slug}`}
                className="group inline-flex items-baseline gap-2 text-foreground transition-colors hover:text-accent"
              >
                <Icon className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-accent" />
                {category.name}
              </Link>
            </h2>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
              {toolCount} tools
            </span>
          </header>

          {subs.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-10 border-t border-border pt-1 sm:grid-cols-2 md:grid-cols-3">
              {subs.map((sub) => (
                <li key={sub.slug} className="min-w-0">
                  <Link
                    href={`/categories/${sub.slug}`}
                    className="group flex items-baseline gap-3 py-2"
                  >
                    <span className="truncate text-[15px] text-foreground transition-colors group-hover:text-accent">
                      {sub.name}
                    </span>
                    <span className="font-mono text-sm tabular-nums text-muted-foreground/80 transition-colors group-hover:text-accent">
                      {sub.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="border-t border-border pt-1 text-sm text-muted-foreground">
              No sub-categories recorded yet.
            </p>
          )}
        </section>
        );
      })}
    </div>
  );
}
