import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Image as ImageIcon,
  LineChart,
  Megaphone,
  Network,
  ShoppingBag,
  Sparkles,
  Wand2,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardCompact } from "@/components/ToolCardCompact";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getPublicCatalogSummary } from "@/lib/public-catalog";
import { CATEGORIES, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "writing-content": Wand2,
  "seo-marketing": Megaphone,
  "image-video": ImageIcon,
  "code-development": Code2,
  "productivity": Sparkles,
  "business-analytics": LineChart,
  "ecommerce-sales": ShoppingBag,
  "research-data": Network,
};

// Curated homepage picks — order matters. Slugs must exist in the catalog.
const FEATURED_SLUGS = [
  "dshplugin",
  "runway-gen-45",
  "alias-browser",
  "depthsight",
  "aniv-ai",
  "echoleads-ai",
  "1clickclaw",
  "attensira",
];

// Per-slug card image overrides for the Featured grid (detail pages keep
// the record's own screenshot_url).
const FEATURED_CARD_IMAGES: Record<string, string> = {
  dshplugin: "/screenshots/dshplugin-card.webp",
};

export const metadata = pageMetadata({
  title: "AI tool discovery index",
  path: "/",
});

export default async function Home() {
  const { tools, toolCount, directoryCount } = await getPublicCatalogSummary();
  const recent = tools.slice(0, 6);
  const featuredPicks = FEATURED_SLUGS.flatMap((slug) => {
    const tool = tools.find((t) => t.slug === slug);
    return tool ? [tool] : [];
  });

  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: tools.filter((t) => t.primary_category === c.slug).length,
  }));
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "aiknows.tools",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/tools?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const featuredListJsonLd = directoryItemListJsonLd({
    tools: recent,
    siteUrl,
    name: "Featured recorded AI tools",
    description: "A sample of recorded AI tools from the public index.",
  });

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(featuredListJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {/* Hero — centered thesis */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Ambient spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-40 ml-spotlight"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at center, color-mix(in srgb, var(--accent) 10%, transparent) 0%, transparent 70%)",
            animation: "ml-spotlight 24s ease-in-out infinite",
          }}
        />
        <div className="container mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <div className="flex flex-col items-center text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              AI tools directory
            </p>
            <h1 className="mt-5 text-balance font-serif text-5xl font-normal leading-[1.04] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-[4.75rem] lg:tracking-[-0.03em]">
              Find the <em className="italic">Right</em> AI Tool for{" "}
              <mark className="rounded-md bg-emphasis px-[0.18em] pb-[0.08em] text-emphasis-foreground [box-decoration-break:clone]">
                Every Task
              </mark>
            </h1>
            <p className="mt-6 text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Search and filter {toolCount}+ AI tools by category and pricing. Every record shows its data source.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-6 text-sm font-medium",
                )}
              >
                Explore AI Tools
              </Link>
              <Link
                href="/submit"
                className="inline-flex h-12 items-center gap-1.5 px-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                Submit Your Tool
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {toolCount}+ AI tools · {directoryCount}+ directories · Live records
            </p>
          </div>
        </div>
      </section>

      {/* Featured picks */}
      <ScrollReveal>
        <section className="border-b border-border">
          <div className="container mx-auto max-w-7xl px-4 py-16 lg:py-20">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  Featured
                </h2>
              </div>
              <Link
                href="/tools"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
              >
                View all tools <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="ml-stagger mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPicks.map((tool) => (
                <ToolCard
                  key={tool.id || tool.slug}
                  tool={tool}
                  compact
                  image={FEATURED_CARD_IMAGES[tool.slug]}
                  badge={tool.slug === "dshplugin" ? "Featured" : undefined}
                />
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Trending AI Tools */}
      <ScrollReveal>
      <section className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                Recent records
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                A sample of recent entries. Click any record to open its dossier.
              </p>
            </div>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-accent"
            >
                View all tools <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          <div className="ml-stagger mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((tool) => (
              <ToolCardCompact key={tool.id || tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* AI Categories */}
      <ScrollReveal>
      <section className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            AI Categories
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Browse the index by what a tool actually does.
          </p>
          <div className="ml-stagger mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryCounts.map((c) => {
              const Icon = CATEGORY_ICON[c.slug] ?? Sparkles;
              return (
                <Link
                  key={c.slug}
                  href={`/categories/${c.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/40 text-foreground transition-colors group-hover:border-accent/40 group-hover:text-accent">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground group-hover:text-accent">
                      {c.name}
                    </span>
                    <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {c.count} {c.count === 1 ? "tool" : "tools"}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      </ScrollReveal>

      {/* Dark Submit CTA */}
      <ScrollReveal>
      <section className="bg-foreground text-background">
        <div className="container mx-auto max-w-5xl px-4 py-20 text-center lg:py-24">
          <h2 className="text-balance font-serif text-4xl font-normal leading-[1.05] tracking-[-0.025em] sm:text-5xl sm:tracking-[-0.035em]">
            Built an AI product?
            <br />
            Get discovered.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-7 text-background/70">
            Submit your AI tool and join the growing AI ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/submit"
              className="inline-flex h-12 items-center gap-2 bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-background/90"
            >
              Submit Your Tool
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tools"
              className="inline-flex h-12 items-center gap-1.5 px-2 text-sm font-medium text-background/80 transition-colors hover:text-background"
            >
              Browse the index <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      </ScrollReveal>
    </div>
  );
}