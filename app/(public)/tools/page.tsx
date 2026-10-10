import { CatalogFallback } from "@/features/catalog/components/catalog-fallback";
import { pageMetadata } from "@/lib/seo/metadata";
import { Suspense } from "react";
import { ToolDiscovery } from "@/components/tool-discovery";
import { directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { getCatalogPage, getCatalogVersion } from "@/features/catalog/server";
import { siteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: "AI Tools",
  description:
    "Search and compare recorded AI tool entries by category, price, and evidence fields.",
  path: "/tools",
});

export default async function ToolsIndexPage() {
  const initialPage = await getCatalogPage();
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

      <Suspense fallback={<CatalogFallback page={initialPage} />}>
        <ToolDiscovery
          key={getCatalogVersion()}
          initialPage={initialPage}
          indexBase={getCatalogVersion()}
        />
      </Suspense>
    </div>
  );
}
