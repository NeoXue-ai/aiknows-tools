import { browsePath } from "@/features/catalog/urls";
import { DEFAULT_QUERY } from "@/features/catalog/query";
import { notFound } from "next/navigation";
import { CatalogFallback } from "@/features/catalog/components/catalog-fallback";
import { pageMetadata } from "@/lib/seo/metadata";
import { Suspense } from "react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { getCatalogPage, getCatalogVersion } from "@/features/catalog/server";
import { siteUrl } from "@/lib/site";

export function toolDirectoryMetadata(page = 1) {
  return pageMetadata({
    title:
      page > 1 ? `AI Tools Directory — Page ${page}` : "AI Tools Directory",
    description:
      page > 1
        ? `Browse page ${page} of the AIKnows directory. Explore more AI tools for writing, design, coding and research, with product details and official website links.`
        : "Explore AI tools for writing, design, coding and research. Browse by task and compare product features, pricing options and official websites.",
    path: browsePath("/tools", page),
  });
}

export default async function ToolsIndexPage({ page = 1 }: { page?: number }) {
  const initialPage = await getCatalogPage({ ...DEFAULT_QUERY, page });
  if (page !== initialPage.page) notFound();
  const heading = "All AI Tools";
  const sub = `${initialPage.total.toLocaleString()} AI tools to explore. Search by name, task, or the way you work.`;
  const jsonLd = directoryItemListJsonLd({
    tools: initialPage.items,
    siteUrl,
    name: heading,
    description: sub,
  });
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-accent">The tool directory</p>
        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 text-pretty text-base leading-7 text-muted-foreground">
          {sub}
        </p>
      </header>

      <Suspense
        fallback={<CatalogFallback page={initialPage} basePath="/tools" />}
      >
        <ToolDiscovery
          key={getCatalogVersion()}
          initialPage={initialPage}
          basePath="/tools"
          indexBase={getCatalogVersion()}
        />
      </Suspense>
    </div>
  );
}
