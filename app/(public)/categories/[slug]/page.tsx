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
    <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm">
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Records</dt>
        <dd className="mt-1 font-mono tabular-nums text-foreground">
          {String(coverage.total).padStart(4, "0")}
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Pricing detail</dt>
        <dd className="mt-1 text-foreground">
          {coverage.withPricingDetail} of {coverage.total} recorded ({fmtPct(coverage.withPricingDetail, coverage.total)})
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Source</dt>
        <dd className="mt-1 text-foreground">
          {coverage.withSource} of {coverage.total} recorded ({fmtPct(coverage.withSource, coverage.total)})
        </dd>
      </div>
      <div>
        <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Verification</dt>
        <dd className="mt-1 text-foreground">
          {coverage.withVerification} of {coverage.total} recorded ({fmtPct(coverage.withVerification, coverage.total)})
        </dd>
      </div>
    </dl>
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
      <div className="mt-3 flex flex-wrap gap-2">
        {subs.map((sub) => {
          const active = sub.slug === activeSlug;
          return (
            <Link
              key={sub.slug}
              href={`/categories/${sub.slug}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "group inline-flex items-baseline gap-2 rounded-md px-3 py-1.5 transition-colors",
                active
                  ? "bg-accent/10 text-accent ring-1 ring-accent/40"
                  : "border border-border hover:border-accent/40",
              )}
            >
              <span className="font-mono text-[11px] text-foreground/90 transition-colors group-hover:text-accent">
                {sub.name}
              </span>
              {typeof sub.count === "number" && (
                <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
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

      <header className="border-y border-border py-8 md:py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Category / {category.name}
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
          {category.name}
        </h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-pretty leading-7 text-muted-foreground">{description}</p>
        ) : null}

        <CoverageStrip coverage={coverage} />

        <SubChips subs={subs} />

        <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
          These numbers are derived from the records on this page only. They exist to flag coverage gaps, not to
          estimate quality or popularity.
        </p>
      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <ToolDiscovery tools={tools} />
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

      <header className="border-y border-border py-8 md:py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          {parent ? `${parent.name} / ` : ""}
          {sub.name}
        </p>
        <h1 className="mt-4 text-balance font-heading text-3xl font-semibold tracking-[-0.02em] sm:text-4xl md:text-5xl">
          {sub.name}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty leading-7 text-muted-foreground">
          {sub.description}
        </p>

        <CoverageStrip coverage={coverage} />

        <SubChips subs={siblings} activeSlug={sub.slug} />

        <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
          These numbers are derived from the records on this page only. They exist to flag coverage gaps, not to
          estimate quality or popularity.
        </p>
      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <ToolDiscovery tools={tools} />
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
