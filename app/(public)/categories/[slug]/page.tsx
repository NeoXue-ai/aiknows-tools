import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ToolGrid } from "@/components/ToolGrid";
import { siteUrl } from "@/lib/site";
import {
  CATEGORIES,
  directoryItemListJsonLd,
} from "@/lib/seo/tool-schema";
import { toolsData } from "@/lib/tools-data";
import type { Tool } from "@/lib/supabase/types";

const TOOLS = toolsData as unknown as Tool[];

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

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORY_BY_SLUG.get(slug);
  if (!category) {
    return { title: "Category not found" };
  }
  const description =
    CATEGORY_DESCRIPTIONS[slug] ?? `AI tools in the ${category.name} category.`;
  return {
    title: `${category.name} AI Tools`,
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
  const tools = TOOLS.filter((t) => t.primary_category === slug);
  const description = CATEGORY_DESCRIPTIONS[slug];

  const jsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: `${category.name} AI Tools`,
    description:
      description ?? `Curated list of ${category.name} AI tools on aiknows.tools.`,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/categories"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All categories
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {category.name} AI Tools
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
        <p className="mt-3 text-sm text-muted-foreground">
          {tools.length} tool{tools.length === 1 ? "" : "s"}
        </p>
      </header>

      <ToolGrid
        tools={tools}
        emptyMessage={`No tools in ${category.name} yet.`}
      />
    </div>
  );
}