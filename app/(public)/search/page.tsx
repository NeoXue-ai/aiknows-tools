import { Suspense } from "react";
import Link from "next/link";
import { ToolDiscovery } from "@/components/tool-discovery";
import { getCatalogPage, getCatalogVersion } from "@/features/catalog/server";
import { pageMetadata } from "@/lib/seo/metadata";
export const metadata = pageMetadata({
  title: "Search AI Tools",
  description: "Search the AIKnows tool directory by name, task or category.",
  path: "/search",
  noIndex: true,
});
export default async function SearchPage() {
  const first = await getCatalogPage();
  return (
    <div className="site-shell py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Search AI tools
        </h1>
        <p className="mt-4 text-muted-foreground">
          Find tools by name, task or category.
        </p>
        <Link href="/tools" className="mt-3 inline-block text-sm text-accent">
          Browse all tools →
        </Link>
      </header>
      <Suspense fallback={<p role="status">Loading the tool search…</p>}>
        <ToolDiscovery initialPage={first} indexBase={getCatalogVersion()} />
      </Suspense>
    </div>
  );
}
