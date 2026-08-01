import { pageMetadata } from "@/lib/seo/metadata";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ExploreByGoal } from "@/components/explore-by-goal";
import { ROUTES, ROUTE_VERSION } from "@/lib/routes";

export const metadata = pageMetadata({
  title: "Numbered taxonomy routes",
  description:
    "Numbered taxonomy routes through the recorded AI tool catalog. Each step links to a reproducible tools query.",
  path: "/collections",
});

export default function CollectionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Numbered taxonomy routes",
    description:
      "Numbered taxonomy routes through the recorded AI tool catalog. Each step links to a reproducible tools query.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/collections`,
  };
  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <header className="mb-10 max-w-3xl border-b border-border pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Routes / {String(ROUTES.length).padStart(2, "0")} entries · config v{ROUTE_VERSION}
        </p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
          Numbered taxonomy routes
        </h1>
        <p className="mt-3 max-w-2xl text-pretty leading-7 text-muted-foreground">
          Routes organize recorded taxonomy into entry points. They do not make recommendations and do not pretend
          to know which tool fits your work; each step declares its filters and links to a reproducible query so the
          same record set comes back after a refresh.
        </p>
      </header>

      <ExploreByGoal />

      <nav className="mt-12 flex items-center justify-between border-t border-border pt-6 text-sm">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-accent"
        >
          Open the full tool index
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
