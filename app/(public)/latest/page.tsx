import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ToolGrid } from "@/components/ToolGrid";
import { siteUrl } from "@/lib/site";
import { directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import toolsData from "@/data/tools.json";
import type { Tool } from "@/lib/supabase/types";

const TOOLS = toolsData as unknown as Tool[];

const PAGE_SIZE = 24;

type Props = { searchParams: Promise<{ page?: string }> };

export const metadata: Metadata = {
  title: "Latest AI Tools",
  description:
    "Newest AI tools added to aiknows.tools. See what indie hackers and AI founders are launching.",
  alternates: { canonical: `${siteUrl}/latest` },
};

export default async function LatestPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  // Seed JSON doesn't include published_at/created_at; sort by array order (most recent last in seed)
  const sorted = [...TOOLS].reverse();
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const tools = sorted.slice(start, start + PAGE_SIZE);

  const jsonLd = directoryItemListJsonLd({
    tools,
    siteUrl,
    name: "Latest AI Tools",
    description: "Newest AI tools curated on aiknows.tools.",
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Latest AI Tools
        </h1>
        <p className="mt-2 text-muted-foreground">
          Newly added AI tools, freshest first.
        </p>
      </header>

      <ToolGrid tools={tools} emptyMessage="No tools yet." />

      <nav className="mt-10 flex items-center justify-between">
        {currentPage > 1 ? (
          <Link
            href={`/latest?page=${currentPage - 1}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Previous
          </Link>
        ) : (
          <span />
        )}
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={`/latest?page=${currentPage + 1}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Next
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}