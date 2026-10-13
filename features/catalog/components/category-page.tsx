import { CategoryGuideSection } from "./category-guide";
import { categoryPageMetadata } from "@/features/catalog/category-metadata";
import { CatalogFallback } from "@/features/catalog/components/catalog-fallback";
import { getCatalogPage, getCatalogVersion } from "@/features/catalog/server";
import { DEFAULT_QUERY } from "@/features/catalog/query";
import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { categoryIcon } from "@/lib/category-icons";
import {
  breadcrumbJsonLd,
  directoryItemListJsonLd,
} from "@/lib/seo/tool-schema";
import { siteUrl } from "@/lib/site";
import {
  countSubs,
  getPublicCategories,
  getPublicTools,
} from "@/features/catalog/server";
import {
  SUBCATEGORIES,
  subBySlug,
  subsForLegacy,
  type Subcategory,
} from "@/lib/subcategories";
import type { Category, Tool } from "@/features/catalog/types";
import { cn } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; page?: number };

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

export async function generateCategoryMetadata({
  params,
  page = 1,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved)
    return { title: "Category not found", robots: { index: false } };
  const tools = await getPublicTools();
  const count = tools.filter((t) =>
    resolved.kind === "category"
      ? t.primary_category === slug
      : t.subcategory === slug,
  ).length;
  const name =
    resolved.kind === "category" ? resolved.category.name : resolved.sub.name;
  return categoryPageMetadata({
    slug,
    name,
    count,
    isCategory: resolved.kind === "category",
    page,
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
      <p className="text-sm font-medium text-muted-foreground">
        Explore a specific task
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
                "inline-flex items-baseline gap-2 rounded-full border px-4 py-2 text-[13px] transition-colors",
                active
                  ? "border-accent/40 bg-accent/10 font-medium text-accent"
                  : "border-border bg-card text-foreground hover:border-accent/30 hover:text-accent",
              )}
            >
              <span>{sub.name}</span>
              {typeof sub.count === "number" && (
                <span className="text-xs tabular-nums text-muted-foreground">
                  {sub.count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default async function CategoryDetailPage({ params, page = 1 }: Props) {
  const { slug } = await params;
  const resolved = await resolve(slug);
  if (!resolved) {
    notFound();
  }

  const allTools = await getPublicTools();

  if (resolved.kind === "category") {
    return (
      <CategoryHub
        category={resolved.category}
        allTools={allTools}
        page={page}
      />
    );
  }
  return (
    <SubCategoryPage
      sub={resolved.sub}
      parent={resolved.parent}
      allTools={allTools}
      page={page}
    />
  );
}

async function CategoryHub({
  category,
  allTools,
  page = 1,
}: {
  category: Category;
  allTools: Tool[];
  page?: number;
}) {
  const tools = allTools.filter(
    (tool) => tool.primary_category === category.slug,
  );
  const initialPage = await getCatalogPage({
    ...DEFAULT_QUERY,
    page,
    category: category.slug,
  });
  if (initialPage.page !== page) notFound();
  const subCounts = countSubs(tools);
  const Icon = categoryIcon(category.slug);
  const subs = subsForLegacy(category.slug)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      count: subCounts.get(s.name) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const description = category.description ?? null;

  const hubListJsonLd = directoryItemListJsonLd({
    tools: initialPage.items,
    siteUrl,
    name: `${category.name} — AIKnows`,
    description: description ?? `Explore AI tools in ${category.name}.`,
  });
  const hubBreadcrumbJsonLd = breadcrumbJsonLd(
    [{ label: "Categories", href: "/categories" }, { label: category.name }],
    siteUrl,
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 md:py-14">
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

      <header className="border-b border-border pb-10 pt-8 md:pb-12 md:pt-10">
        <p className="text-sm font-medium text-accent">Category</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/8">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.045em] sm:text-4xl md:text-5xl">
            {category.name}
          </h1>
        </div>
        {description ? (
          <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}

        <SubChips subs={subs} />
      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <Suspense
            fallback={
              <CatalogFallback
                page={initialPage}
                basePath={`/categories/${category.slug}`}
              />
            }
          >
            <ToolDiscovery
              key={getCatalogVersion()}
              initialPage={initialPage}
              indexBase={getCatalogVersion()}
              basePath={`/categories/${category.slug}`}
              scope={{ category: category.slug }}
              variant="scoped"
            />
          </Suspense>
        </div>

        {page === 1 && <CategoryGuideSection slug={category.slug} />}

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
  page = 1,
}: {
  sub: Subcategory;
  parent: Category | null;
  allTools: Tool[];
  page?: number;
}) {
  const tools = allTools.filter((tool) => tool.sub === sub.name);
  const initialPage = await getCatalogPage({
    ...DEFAULT_QUERY,
    page,
    subcategory: sub.slug,
  });
  if (initialPage.page !== page) notFound();
  const subCounts = countSubs(allTools);
  const siblings = subsForLegacy(sub.legacySlug)
    .map((s) => ({
      slug: s.slug,
      name: s.name,
      count: subCounts.get(s.name) ?? 0,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const subListJsonLd = directoryItemListJsonLd({
    tools: initialPage.items,
    siteUrl,
    name: `${sub.name} — AIKnows`,
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
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 md:py-14">
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

      <header className="border-b border-border pb-10 pt-8 md:pb-12 md:pt-10">
        <p className="text-sm font-medium text-accent">Explore by task</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
          {sub.name}
        </h1>
        <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground">
          {sub.description}
        </p>

        <SubChips subs={siblings} activeSlug={sub.slug} />
      </header>

      <div className="grid gap-10 py-10">
        <div className="min-w-0">
          <Suspense
            fallback={
              <CatalogFallback
                page={initialPage}
                basePath={`/categories/${sub.slug}`}
              />
            }
          >
            <ToolDiscovery
              key={getCatalogVersion()}
              initialPage={initialPage}
              indexBase={getCatalogVersion()}
              basePath={`/categories/${sub.slug}`}
              scope={{ subcategory: sub.slug }}
              variant="scoped"
            />
          </Suspense>
        </div>

        {page === 1 && <CategoryGuideSection slug={sub.slug} />}

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
