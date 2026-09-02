import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { categoryIcon } from "@/lib/category-icons";
import { breadcrumbJsonLd, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { siteUrl } from "@/lib/site";
import {
  countSubs,
  getPublicCategories,
  getPublicTools,
} from "@/lib/public-catalog";
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

// Per-category Title + Description templates. {count} is interpolated with
// the live tool count. Patterns follow the audit's verbatim shape —
// "Best AI {Category} Tools 2026 — {count} {Variants} Apps" and a
// "Find the best ... Compare {count}+ ..." description with category-
// specific variants.
const CATEGORY_TDK: Record<string, { titleTemplate: string; descTemplate: string }> = {
  "writing-content": {
    titleTemplate:
      "Best AI Writing & Content Tools 2026 — {count} AI Writer & Content Generator Apps",
    descTemplate:
      "Find the best AI writing tools & content software in 2026. Compare {count}+ AI writers, paraphrasing tools, grammar checkers, and SEO content generators — with pricing, features, and verified data sources.",
  },
  "seo-marketing": {
    titleTemplate:
      "Best AI SEO & Marketing Tools 2026 — {count} AI Optimization & Campaign Apps",
    descTemplate:
      "Find the best AI SEO & marketing tools in 2026. Compare {count}+ AI SEO tools, marketing automation, social media managers, and ad creative generators — with pricing, features, and verified data sources.",
  },
  "image-video": {
    titleTemplate:
      "Best AI Image & Video Tools 2026 — {count} AI Generation & Editing Apps",
    descTemplate:
      "Find the best AI image & video tools in 2026. Compare {count}+ AI image generators, video creation tools, background removers, and photo enhancers — with pricing, features, and verified data sources.",
  },
  "code-development": {
    titleTemplate:
      "Best AI Code & Development Tools 2026 — {count} AI Coding Assistant & Generator Apps",
    descTemplate:
      "Find the best AI code & development tools in 2026. Compare {count}+ AI coding assistants, code generators, debugging tools, and API builders — with pricing, features, and verified data sources.",
  },
  productivity: {
    titleTemplate:
      "Best AI Productivity Tools 2026 — {count} AI Automation & Workflow Apps",
    descTemplate:
      "Find the best AI productivity tools & automation software in 2026. Compare {count}+ AI task managers, workflow apps, scheduling tools, and AI agents — with pricing, features, and verified data sources.",
  },
  "business-analytics": {
    titleTemplate:
      "Best AI Business & Analytics Tools 2026 — {count} AI Research & BI Apps",
    descTemplate:
      "Find the best AI business & analytics tools in 2026. Compare {count}+ AI research assistants, business intelligence, data visualization, and reporting tools — with pricing, features, and verified data sources.",
  },
  "ecommerce-sales": {
    titleTemplate:
      "Best AI E-commerce & Sales Tools 2026 — {count} AI Store Builder & Conversion Apps",
    descTemplate:
      "Find the best AI e-commerce & sales tools in 2026. Compare {count}+ AI store builders, product description writers, conversion optimizers, and sales assistants — with pricing, features, and verified data sources.",
  },
  "research-data": {
    titleTemplate:
      "Best AI Research & Data Tools 2026 — {count} AI Research Assistant & Data Analysis Apps",
    descTemplate:
      "Find the best AI research & data tools in 2026. Compare {count}+ AI research tools, data analysis, no-code platforms, and knowledge bases — with pricing, features, and verified data sources.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved) {
    return { title: "Category not found" };
  }
  if (resolved.kind === "category") {
    const tdk = CATEGORY_TDK[resolved.category.slug];
    if (tdk) {
      const tools = await getPublicTools();
      const count = tools.filter(
        (t) => t.primary_category === resolved.category.slug,
      ).length;
      const interpolatedCount = count.toLocaleString();
      return pageMetadata({
        title: tdk.titleTemplate.replace("{count}", interpolatedCount),
        description: tdk.descTemplate.replace("{count}", interpolatedCount),
        path: `/categories/${slug}`,
      });
    }
    const description =
      resolved.category.description ??
      `Recorded AI tool entries in ${resolved.category.name}.`;
    return pageMetadata({
      title: resolved.category.name,
      description,
      path: `/categories/${slug}`,
    });
  }
  // SEO: every sub-category gets a per-page TDK template parallel to the
  // top-level audit pattern. {count} is the live tool count for this sub.
  // Title uses absoluteTitle=false so root layout's title.template
  // ("%s | aiknows.tools") appends the suffix.
  const subTools = (await getPublicTools()).filter(
    (t) => t.sub === resolved.sub.name,
  );
  const subCount = subTools.length;
  const subCountStr = subCount.toLocaleString();
  // SEO: the Email sub merges both "best temp mail" and "temp mail best"
  // query intents into a single title so Google treats one page as the
  // canonical answer for both phrasings (audit P4.1).
  const subTitle =
    resolved.sub.name === "Email"
      ? `Best Temp Mail & Email Tools 2026 — ${subCountStr} AI Apps`
      : `Best ${resolved.sub.name} 2026 — ${subCountStr} AI Apps`;
  const subDescription = `${resolved.sub.description} Find the best ${resolved.sub.name} in 2026 — compare ${subCountStr}+ tools with pricing, features, and verified data sources.`;
  return pageMetadata({
    title: subTitle,
    description: subDescription,
    path: `/categories/${slug}`,
  });
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
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
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
                "inline-flex items-baseline gap-2 rounded-md border px-3.5 py-2 text-sm transition-colors",
                active
                  ? "border-accent/40 bg-accent/10 font-medium text-accent"
                  : "border-border text-foreground hover:border-accent/40 hover:text-accent",
              )}
            >
              <span>{sub.name}</span>
              {typeof sub.count === "number" && (
                <span className="text-xs tabular-nums text-muted-foreground">
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
  const subCounts = countSubs(allTools);
  const Icon = categoryIcon(category.slug);
  const subs = subsForLegacy(category.slug)
    .map((s) => ({ slug: s.slug, name: s.name, count: subCounts.get(s.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const description = category.description ?? null;

  const hubListJsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${category.name} — aiknows.tools`,
    description: description ?? `Recorded AI tool entries in ${category.name}.`,
  });
  const hubBreadcrumbJsonLd = breadcrumbJsonLd(
    [
      { label: "Categories", href: "/categories" },
      { label: category.name },
    ],
    siteUrl,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hubListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(hubBreadcrumbJsonLd).replace(/</g, "\\u003c"),
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
        <div className="mt-4 flex items-center gap-3">
          <Icon className="h-7 w-7 shrink-0 text-accent" />
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl md:text-5xl">
            {category.name}
          </h1>
        </div>
        {description ? (
          <p className="mt-3 max-w-3xl text-pretty leading-7 text-muted-foreground">{description}</p>
        ) : null}

        <SubChips subs={subs} />

      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <Suspense fallback={<ToolDiscoveryFallback count={tools.length} />}>
            <ToolDiscovery tools={tools} variant="scoped" />
          </Suspense>
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
  const subCounts = countSubs(allTools);
  const siblings = subsForLegacy(sub.legacySlug)
    .map((s) => ({ slug: s.slug, name: s.name, count: subCounts.get(s.name) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const subListJsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${sub.name} — aiknows.tools`,
    description: sub.description,
  });
  const subBreadcrumbJsonLd = breadcrumbJsonLd(
    [
      { label: "Categories", href: "/categories" },
      ...(parent
        ? [{ label: parent.name, href: `/categories/${parent.slug}` }]
        : []),
      { label: sub.name },
    ],
    siteUrl,
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(subListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(subBreadcrumbJsonLd).replace(/</g, "\\u003c"),
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

        <SubChips subs={siblings} activeSlug={sub.slug} />

      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <Suspense fallback={<ToolDiscoveryFallback count={tools.length} />}>
            <ToolDiscovery tools={tools} variant="scoped" />
          </Suspense>
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

function ToolDiscoveryFallback({ count }: { count: number }) {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="rounded-2xl border border-border bg-card p-1.5">
        <div className="h-12 animate-pulse rounded-xl bg-secondary" />
      </div>
      <div className="font-mono text-xs tabular-nums text-muted-foreground">
        {count} results
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}
