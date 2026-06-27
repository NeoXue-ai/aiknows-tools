import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { CategoryPill } from "@/components/CategoryPill";
import { ToolGrid } from "@/components/ToolGrid";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/lib/site";
import {
  categoryName,
  toolJsonLd,
} from "@/lib/seo/tool-schema";
import { toolsData } from "@/lib/tools-data";
import type { Tool } from "@/lib/supabase/types";

const TOOLS = toolsData as unknown as Tool[];

const TOOL_BY_SLUG = new Map(TOOLS.map((t) => [t.slug, t]));

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG.get(slug);
  if (!tool) {
    return { title: "Tool not found" };
  }
  const description = tool.tagline ?? tool.description ?? undefined;
  return {
    title: `${tool.name} — aiknows.tools`,
    description,
    alternates: { canonical: `${siteUrl}/tools/${slug}` },
    openGraph: {
      title: `${tool.name} — aiknows.tools`,
      description,
      url: `${siteUrl}/tools/${slug}`,
      type: "website",
    },
  };
}

function relatedTools(tool: Tool, limit = 6): Tool[] {
  return TOOLS.filter(
    (t) => t.primary_category === tool.primary_category && t.slug !== tool.slug
  ).slice(0, limit);
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = TOOL_BY_SLUG.get(slug);
  if (!tool) {
    notFound();
  }
  const related = relatedTools(tool);
  const jsonLd = toolJsonLd({
    tool,
    categoryName: categoryName(tool.primary_category),
    siteUrl,
  });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Link
        href="/tools"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All tools
      </Link>

      <header className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-xl font-semibold text-primary">
            {tool.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {tool.name}
            </h1>
            {tool.tagline ? (
              <p className="mt-1 text-lg text-muted-foreground">{tool.tagline}</p>
            ) : null}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <CategoryPill
            category={{
              slug: tool.primary_category,
              name: categoryName(tool.primary_category),
            }}
          />
          {tool.pricing_type ? (
            <Badge variant="outline">{tool.pricing_type}</Badge>
          ) : null}
          {tool.pricing_detail ? (
            <Badge variant="secondary">{tool.pricing_detail}</Badge>
          ) : null}
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="ghost" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Visit website <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </div>
      </header>

      {tool.description ? (
        <section className="mb-12 max-w-3xl">
          <h2 className="mb-3 text-xl font-semibold">About</h2>
          <p className="whitespace-pre-line text-muted-foreground">
            {tool.description}
          </p>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section>
          <h2 className="mb-4 text-xl font-semibold">More like this</h2>
          <ToolGrid tools={related} />
        </section>
      ) : null}
    </div>
  );
}