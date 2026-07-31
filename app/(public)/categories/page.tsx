import type { Metadata } from "next";
import { CategoryAtlasNav, type CategoryNavItem } from "@/components/category-atlas-nav";
import { CategoryAtlas, type CategorySection } from "@/components/category-atlas";
import {
  computeCategoryCoverage,
  getPublicCategories,
  getPublicTools,
} from "@/lib/public-catalog";
import { siteUrl } from "@/lib/site";
import type { Tool } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse the AIknows index by top-level category. Each section lists recorded tools, coverage of pricing detail and recorded source, and a representative preview.",
};

function previewFor(tools: Tool[]): Tool[] {
  return [...tools]
    .sort(
      (a, b) =>
        (b.dr ?? -1) - (a.dr ?? -1) || a.name.localeCompare(b.name),
    )
    .slice(0, 6);
}

export default async function CategoriesIndexPage() {
  const [categories, tools] = await Promise.all([
    getPublicCategories(),
    getPublicTools(),
  ]);

  const sections: CategorySection[] = categories.map((category) => {
    const inCategory = tools.filter((tool) => tool.primary_category === category.slug);
    return {
      category,
      coverage: computeCategoryCoverage(inCategory),
      previewTools: previewFor(inCategory),
    };
  });

  // Populated sections lead; empty ones stay visible but trail.
  const ordered = [
    ...sections.filter((s) => s.coverage.total > 0),
    ...sections.filter((s) => s.coverage.total === 0),
  ];

  const navItems: CategoryNavItem[] = ordered.map((s) => ({
    slug: s.category.slug,
    name: s.category.name,
  }));

  const totalRecords = ordered.reduce((sum, s) => s.coverage.total, 0);
  const populatedCount = ordered.filter((s) => s.coverage.total > 0).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AIknows — Categories",
    description:
      "Top-level categories of recorded AI tools, with coverage facts derived from the public catalog.",
    url: `${siteUrl}/categories`,
    hasPart: ordered.map((s) => ({
      "@type": "WebPage",
      name: s.category.name,
      url: `${siteUrl}/categories/${s.category.slug}`,
    })),
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="mb-10 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Categories / {String(ordered.length).padStart(2, "0")} entries ·{" "}
          {String(totalRecords).padStart(4, "0")} tool records ·{" "}
          {String(populatedCount).padStart(2, "0")} populated
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Browse the index by category
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          {ordered.length} top-level categories recorded in the public catalog. Coverage
          numbers and preview tools below are computed from the current records — no
          estimates.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[16rem_1fr]">
        <CategoryAtlasNav items={navItems} />
        <CategoryAtlas sections={ordered} />
      </div>

      <p className="mt-10 max-w-3xl text-xs leading-5 text-muted-foreground">
        Coverage notes above are computed from the same records the matching page
        renders, so they stay consistent if entries are added or amended. Categories
        with no recorded tools still appear, marked with 0, so gaps in the index are
        visible.
      </p>
    </div>
  );
}