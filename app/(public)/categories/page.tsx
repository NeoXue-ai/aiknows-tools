import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/seo/tool-schema";
import { getPublicTools, getPublicDirectories } from "@/lib/public-catalog";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Recorded AI tool categories and directory submission facts derived from the public catalog. Counts and coverage notes are computed from the current record set.",
};

type CategoryRow = {
  slug: string;
  name: string;
  href: string;
  count: number;
  withPricingDetail?: number;
  withSource?: number;
  detail?: string;
};

function buildToolRows(tools: Awaited<ReturnType<typeof getPublicTools>>): CategoryRow[] {
  const counts = new Map<string, { total: number; withPricingDetail: number; withSource: number }>();
  for (const tool of tools) {
    const entry = counts.get(tool.primary_category) ?? { total: 0, withPricingDetail: 0, withSource: 0 };
    entry.total += 1;
    if (tool.pricing_detail?.trim()) entry.withPricingDetail += 1;
    if (tool.source?.trim()) entry.withSource += 1;
    counts.set(tool.primary_category, entry);
  }
  return CATEGORIES.map((c) => {
    const entry = counts.get(c.slug);
    return {
      slug: c.slug,
      name: c.name,
      href: `/categories/${c.slug}`,
      count: entry?.total ?? 0,
      withPricingDetail: entry?.withPricingDetail ?? 0,
      withSource: entry?.withSource ?? 0,
    };
  });
}

export default async function CategoriesIndexPage() {
  const [tools, directories] = await Promise.all([
    getPublicTools(),
    getPublicDirectories(),
  ]);

  const toolRows = buildToolRows(tools).filter((row) => row.count > 0);

  const directoryRows: CategoryRow[] = [
    {
      slug: "directories",
      name: "Directories",
      href: "/categories/directories",
      count: directories.length,
      detail: "Submission outlets recorded with DR, type, price, link type, and last check.",
    },
  ];

  const rows: CategoryRow[] = [...toolRows, ...directoryRows];
  const totalRecords = toolRows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <header className="mb-10 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Categories / {String(rows.length).padStart(2, "0")} entries · {String(totalRecords).padStart(4, "0")} tool records
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Browse the index by category
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Eight recorded tool categories plus the directory submission index. Counts and coverage notes are
          computed from the current public catalog, not estimated.
        </p>
      </header>

      {rows.length === 0 ? (
        <p className="border-y border-border py-10 text-sm text-muted-foreground">
          No categories have recorded entries yet. Add tools through the editorial workflow to fill this index.
        </p>
      ) : (
        <ol className="border-y border-border">
          {rows.map((row, idx) => (
            <li key={row.slug} className="border-b border-border last:border-b-0">
              <Link
                href={row.href}
                className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-4 px-1 py-5 transition-colors hover:bg-secondary/40"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <span className="block text-balance text-base font-medium text-foreground group-hover:text-accent">
                    {row.name}
                  </span>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {row.detail ? (
                      <>{row.count} {row.count === 1 ? "entry" : "entries"} · {row.detail}</>
                    ) : (
                      <>
                        {row.count} record{row.count === 1 ? "" : "s"} ·{" "}
                        {row.withPricingDetail} with pricing detail ·{" "}
                        {row.withSource} with recorded source
                      </>
                    )}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
              </Link>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        Coverage notes above are computed from the same records the matching page renders, so they stay
        consistent if entries are added or amended.
      </p>
    </div>
  );
}
