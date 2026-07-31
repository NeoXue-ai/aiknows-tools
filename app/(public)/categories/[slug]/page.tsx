import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { siteUrl } from "@/lib/site";
import {
  CATEGORIES,
  directoryItemListJsonLd,
} from "@/lib/seo/tool-schema";
import { getPublicTools } from "@/lib/public-catalog";

const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "writing-content":
    "AI writing assistants, copy generators, and content editors for marketers and creators.",
  "seo-marketing":
    "SEO tools, growth marketing, analytics, and ad optimization.",
  "image-video":
    "AI image generation, video editing, and creative tools.",
  "code-development":
    "AI code assistants, dev tools, and code review.",
  productivity:
    "Workflow automation, task managers, and AI agents.",
  "business-analytics":
    "Business intelligence, dashboards, and AI for ops.",
  "ecommerce-sales":
    "AI sales tools, e-commerce platforms, and conversion optimization.",
  "research-data":
    "AI research assistants, data analysis, and knowledge management.",
};

type Coverage = {
  total: number;
  withPricingDetail: number;
  withSource: number;
  withTags: number;
  withDescription: number;
  withVerification: number;
};

function computeCoverage<T extends { pricing_detail?: string | null; source?: string | null; tags?: unknown; description?: string | null; is_verified?: boolean }>(tools: T[]): Coverage {
  let withPricingDetail = 0;
  let withSource = 0;
  let withTags = 0;
  let withDescription = 0;
  let withVerification = 0;
  for (const tool of tools) {
    if (tool.pricing_detail?.trim()) withPricingDetail += 1;
    if (tool.source?.trim()) withSource += 1;
    if (Array.isArray(tool.tags) && tool.tags.length > 0) withTags += 1;
    if (tool.description?.trim()) withDescription += 1;
    if (tool.is_verified) withVerification += 1;
  }
  return { total: tools.length, withPricingDetail, withSource, withTags, withDescription, withVerification };
}

function fmtPct(part: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) {
    return { title: "Category not found" };
  }
  const description =
    CATEGORY_DESCRIPTIONS[slug] ?? `Recorded AI tool entries in ${category.name}.`;
  return {
    title: `${category.name} — aiknows.tools`,
    description,
    alternates: { canonical: `${siteUrl}/categories/${slug}` },
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) {
    notFound();
  }
  const allTools = await getPublicTools();
  const tools = allTools.filter((tool) => tool.primary_category === slug);
  const description = CATEGORY_DESCRIPTIONS[slug];
  const coverage = computeCoverage(tools);

  const jsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${category.name} — aiknows.tools`,
    description:
      description ?? `Recorded AI tool entries in ${category.name}.`,
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
