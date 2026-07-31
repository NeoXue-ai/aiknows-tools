import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { siteUrl } from "@/lib/site";
import { directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import {
  computeCategoryCoverage,
  countSubs,
  getPublicCategories,
  getPublicTools,
} from "@/lib/public-catalog";
import type { CategoryCoverage } from "@/lib/public-catalog";
import {
  SUBCATEGORIES,
  subBySlug,
  subsForLegacy,
  type Subcategory,
} from "@/lib/subcategories";
import type { Category, Tool } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const categories = await getPublicCategories();
  return [
    ...categories.map((c) => ({ slug: c.slug })),
    ...SUBCATEGORIES.map((s) => ({ slug: s.slug })),
  ];
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

type Resolved =
  | { kind: "category"; category: Category }
  | { kind: "sub"; sub: Subcategory; parent: Category | null };

async function resolve(slug: string): Promise<Resolved | null> {
  const categories = await getPublicCategories();
  const category = categories.find((c) => c.slug === slug);
  if (category) return { kind: "category", category };
  const sub = subBySlug(slug);
  if (sub) {
    const parent = categories.find((c) => c.slug === sub.legacySlug) ?? null;
    return { kind: "sub", sub, parent };
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved) {
    return { title: "Category not found" };
  }
  if (resolved.kind === "category") {
    const description =
      resolved.category.description ??
      `Recorded AI tool entries in ${resolved.category.name}.`;
    return {
      title: `${resolved.category.name} — aiknows.tools`,
      description,
      alternates: { canonical: `${siteUrl}/categories/${slug}` },
    };
  }
  return {
    title: `${resolved.sub.name} — aiknows.tools`,
    description: resolved.sub.description,
    alternates: { canonical: `${siteUrl}/categories/${slug}` },
  };
}

function CoverageStrip({ coverage }: { coverage: CategoryCoverage }) {
  return (
    <p className="mt-6 font-mono text-[11px] tabular-nums text-muted-foreground">
      {`${String(coverage.total).padStart(4, "0")} record${coverage.total === 1 ? "" : "s"} · pricing ${fmtPct(coverage.withPricingDetail, coverage.total)} · source ${fmtPct(coverage.withSource, coverage.total)} · verification ${fmtPct(coverage.withVerification, coverage.total)}`}
    </p>
  );
}

function SubChips({
  subs,
  activeSlug,
}: {
  subs: { slug: string; name: string; count?: number }[];
  activeSlug?: string;
}) {
  return (
    <div className="mt-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Sub-categories
      </p>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {subs.map((sub) => {
          const active = sub.slug === activeSlug;
          return (
            <Link
              key={sub.slug}
              href={`/categories/${sub.slug}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "inline-flex items-baseline gap-1.5 rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors",
                active
                  ? "bg-accent/10 font-medium text-accent"
                  : "text-muted-foreground hover:text-accent",
              )}
            >
              <span>{sub.name}</span>
              {typeof sub.count === "number" && (
                <span className="text-[10px] tabular-nums text-muted-foreground/70">
                  {String(sub.count).padStart(2, "0")}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved) {
    notFound();
  }

  const allTools = await getPublicTools();

  if (resolved.kind === "category") {
    return <CategoryHub category={resolved.category} allTools={allTools} />;
  }
  return <SubCategoryPage sub={resolved.sub} parent={resolved.parent} allTools={allTools} />;
}

async function CategoryHub({
  category,
  allTools,
}: {
  category: Category;
  allTools: Tool[];
}) {
  const tools = allTools.filter((tool) => tool.primary_category === category.slug);
  const coverage = computeCategoryCoverage(tools);
  const subCounts = countSubs(allTools);
  const subs = subsForLegacy(category.slug)
    .map((s) => ({ slug: s.slug, name: s.name, count: subCounts.get(s.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const description = category.description ?? null;

  const jsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${category.name} — aiknows.tools`,
    description: description ?? `Recorded AI tool entries in ${category.name}.`,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <BreadcrumbNav
        segments={[
          { label: "Categories", href: "/categories" },
          { label: category.name },
        ]}
      />

      <header className="border-b border-border py-10 md:py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Category
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
          {category.name}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-pretty leading-7 text-muted-foreground">{description}</p>
        ) : null}

        <CoverageStrip coverage={coverage} />

        <SubChips subs={subs} />

      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <ToolDiscovery tools={tools} variant="scoped" />
        </div>

        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All categories
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          >
            Full tool index
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </div>
  );
}

async function SubCategoryPage({
  sub,
  parent,
  allTools,
}: {
  sub: Subcategory;
  parent: Category | null;
  allTools: Tool[];
}) {
  const tools = allTools.filter((tool) => tool.sub === sub.name);
  const coverage = computeCategoryCoverage(tools);
  const subCounts = countSubs(allTools);
  const siblings = subsForLegacy(sub.legacySlug)
    .map((s) => ({ slug: s.slug, name: s.name, count: subCounts.get(s.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const jsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${sub.name} — aiknows.tools`,
    description: sub.description,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <BreadcrumbNav
        segments={[
          { label: "Categories", href: "/categories" },
          ...(parent
            ? [{ label: parent.name, href: `/categories/${parent.slug}` }]
            : []),
          { label: sub.name },
        ]}
      />

      <header className="border-b border-border py-10 md:py-12">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Sub-category
        </p>
        <h1 className="mt-4 text-balance font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          {sub.name}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty leading-7 text-muted-foreground">
          {sub.description}
        </p>

        <CoverageStrip coverage={coverage} />

        <SubChips subs={siblings} activeSlug={sub.slug} />

      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <ToolDiscovery tools={tools} variant="scoped" />
        </div>

        <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
          <Link
            href={parent ? `/categories/${parent.slug}` : "/categories"}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {parent ? `Back to ${parent.name}` : "All categories"}
          </Link>
          <Link
            href="/tools"
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
          >
            Full tool index
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </nav>
      </div>
    </div>
  );
}

function fmtPct(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}
