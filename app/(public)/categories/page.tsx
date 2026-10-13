import { pageMetadata } from "@/lib/seo/metadata";
import { CategoryIndex, type CategoryGroup } from "@/components/category-index";
import {
  countSubs,
  getPublicCategories,
  getPublicTools,
} from "@/features/catalog/server";
import { subsForLegacy } from "@/lib/subcategories";
import { siteUrl } from "@/lib/site";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = pageMetadata({
  title: "AI Tool Categories for Work & Creativity",
  description:
    "Browse AI tools by category and task, from writing and image generation to coding, video and research. Explore the AIKnows directory to find your next tool.",
  path: "/categories",
});

export default async function CategoriesIndexPage() {
  const [categories, tools] = await Promise.all([
    getPublicCategories(),
    getPublicTools(),
  ]);

  const subCounts = countSubs(tools);

  const groups: CategoryGroup[] = categories.map((category) => {
    const inCategory = tools.filter(
      (tool) => tool.primary_category === category.slug,
    );
    const subs = subsForLegacy(category.slug)
      .map((s) => ({
        slug: s.slug,
        name: s.name,
        count: subCounts.get(s.name) ?? 0,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    return {
      category,
      toolCount: inCategory.length,
      subs,
    };
  });

  // Populated sections lead; empty ones stay visible but trail.
  const ordered = [
    ...groups.filter((s) => s.toolCount > 0),
    ...groups.filter((s) => s.toolCount === 0),
  ];

  const totalRecords = ordered.reduce((sum, s) => sum + s.toolCount, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AIKnows — AI Tool Categories",
    description:
      "Explore AI tools by category and task, including writing, design, coding, video and research.",
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
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="mb-12">
        <p className="text-sm font-medium text-accent">Explore by category</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Explore AI tools by category.
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
          Explore {totalRecords.toLocaleString()} tools across {ordered.length}{" "}
          categories. Start with a category, then find the right tool for the
          task at hand.
        </p>
      </header>

      <CategoryIndex groups={ordered} />

      <nav className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Explore all tools
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Browse collections
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </div>
  );
}
