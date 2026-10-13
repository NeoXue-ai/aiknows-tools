import { siteUrl } from "@/lib/site";
import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExploreByGoal } from "@/components/explore-by-goal";
import { ROUTES } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "AI Tool Collections by Task & Workflow",
  description:
    "Explore AI tool collections for creative work, coding, research and everyday tasks. Follow a workflow to find related tools in the AIKnows directory.",
  path: "/collections",
});

export default function CollectionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AI Tool Collections by Task & Workflow",
    description:
      "Explore AI tool collections for creative work, coding, research and everyday tasks. Follow a workflow to find related tools in the AIKnows directory.",
    url: `${siteUrl}/collections`,
  };
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 sm:px-8 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-accent">
          Explore by task / {ROUTES.length} workflows
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
          Find tools for the next step in your workflow.
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Start with what you want to create or improve. Each collection takes
          you through related tasks and links to tools you can explore, from a
          first idea to the next stage of your work.
        </p>
      </header>

      <ExploreByGoal />

      <nav className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Browse all AI tools
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Browse by category
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </div>
  );
}
