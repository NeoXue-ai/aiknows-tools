import { pageMetadata } from "@/lib/seo/metadata";
import { CategoryAtlasNav, type CategoryNavItem } from "@/components/category-atlas-nav";
import { CategoryAtlas, type CategorySection } from "@/components/category-atlas";
import {
  countSubs,
  getPublicCategories,
  getPublicTools,
} from "@/lib/public-catalog";
import { subsForLegacy } from "@/lib/subcategories";
import { siteUrl } from "@/lib/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = pageMetadata({
  title: "AI tool categories",
  description:
    "Browse the AIknows index by top-level category and inspect the recorded sub-categories and tool counts.",
  path: "/categories",
});

export default async function CategoriesIndexPage() {
  const [categories, tools] = await Promise.all([
    getPublicCategories(),
    getPublicTools(),
  ]);

  const subCounts = countSubs(tools);

  const sections: CategorySection[] = categories.map((category) => {
    const inCategory = tools.filter((tool) => tool.primary_category === category.slug);
    const subs = subsForLegacy(category.slug)
      .map((s) => ({ slug: s.slug, name: s.name, count: subCounts.get(s.name) ?? 0 }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return {
      category,
      toolCount: inCategory.length,
      subs,
    };
  });

  // Populated sections lead; empty ones stay visible but trail.
  const ordered = [
    ...sections.filter((s) => s.toolCount > 0),
    ...sections.filter((s) => s.toolCount === 0),
  ];

  const navItems: CategoryNavItem[] = ordered.map((s) => ({
    slug: s.category.slug,
    name: s.category.name,
  }));

  const totalRecords = ordered.reduce((sum, s) => sum + s.toolCount, 0);
  const populatedCount = ordered.filter((s) => s.toolCount > 0).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AIknows — Categories",
    description:
      "Top-level categories of recorded AI tools, with coverage facts derived from the public catalog.",
    url: `${siteUrl}/categories`,
    hasPart: ordered.flatMap((s) => [
      {
        "@type": "WebPage",
        name: s.category.name,
        url: `${siteUrl}/categories/${s.category.slug}`,
      },
      ...s.subs.map((sub) => ({
        "@type": "WebPage",
        name: sub.name,
        url: `${siteUrl}/categories/${sub.slug}`,
      })),
    ]),
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
          {ordered.length} top-level categories in the public catalog, each broken into
          sub-categories. Counts below are live tool counts from the current records.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[16rem_1fr]">
        <CategoryAtlasNav items={navItems} />
        <CategoryAtlas sections={ordered} />
      </div>

      <nav className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Open the full tool index
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Numbered taxonomy routes
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </div>
  );
}