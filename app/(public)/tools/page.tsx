import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { CATEGORIES, categoryName, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { getPublicTools } from "@/lib/public-catalog";

type Props = {
  searchParams: Promise<{
    category?: string;
    q?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, q } = await searchParams;
  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;

  if (q) {
    return pageMetadata({
      title: `Search "${q}"`,
      description: `Search results for "${q}" across the aiknows.tools directory.`,
      path: "/tools",
    });
  }
  if (selected) {
    return pageMetadata({
      title: `AI Tools — ${selected.name}`,
      description: `Recorded AI tool entries in ${selected.name}.`,
      path: "/tools",
    });
  }
  return pageMetadata({
    title: "AI Tools",
    description: "Search and compare recorded AI tool entries by category, price, and evidence fields.",
    path: "/tools",
  });
}

export default async function ToolsIndexPage({ searchParams }: Props) {
  const { category, q } = await searchParams;

  const allTools = await getPublicTools();
  const tools = category
    ? allTools.filter((tool) => tool.primary_category === category)
    : allTools;

  const selected = category ? CATEGORIES.find((c) => c.slug === category) : null;
  const heading = selected
    ? `AI Tools — ${selected.name}`
    : "All AI Tools";
  const sub = selected
    ? `${tools.length} recorded tool entr${tools.length === 1 ? "y" : "ies"} in ${categoryName(selected.slug)}.`
    : `${tools.length} recorded AI tool entries. Compare the fields available for each record.`;
  const jsonLd = directoryItemListJsonLd({
    tools: tools.slice(0, 50),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    name: heading,
    description: sub,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-8 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Tool index / {String(tools.length).padStart(4, "0")} records
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          {q ? `Results for "${q}"` : heading}
        </h1>
        <p className="mt-3 text-pretty leading-7 text-muted-foreground">{sub}</p>
      </header>

      <Suspense fallback={<ToolDiscoveryFallback count={tools.length} />}>
        <ToolDiscovery tools={tools} initialQ={q ?? ""} />
      </Suspense>
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