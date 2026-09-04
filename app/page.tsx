import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { ToolCard } from "@/components/ToolCard";
import { ToolCardCompact } from "@/components/ToolCardCompact";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getPublicCatalogSummary } from "@/lib/public-catalog";
import { CATEGORIES, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";

// SEO skeleton: each category's H3 + description paragraph gives Google a
// keyword-rich category backbone. Per the audit, this section replaces the
// previous icon-card grid — Google reads semantic H2/H3/p/a, not card spans.
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "image-video":
    "AI image generators, video creation tools, background removers, photo enhancers.",
  "code-development":
    "AI coding assistants, code generators, debugging tools, API builders.",
  "writing-content":
    "AI writers, paraphrasing tools, grammar checkers, SEO content generators.",
  "productivity":
    "AI task managers, workflow automation, scheduling, AI agents.",
  "seo-marketing":
    "AI SEO tools, marketing automation, social media managers, ad creative generators.",
  "business-analytics":
    "AI research assistants, business intelligence, data visualization, reporting tools.",
  "ecommerce-sales":
    "AI store builders, product description writers, conversion optimizers, sales assistants.",
  "research-data":
    "AI research tools, data analysis, no-code platforms, knowledge bases.",
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

// SEO: title and description follow the 哥飞 audit's verbatim wording,
// with the tool count interpolated. absoluteTitle bypasses the root layout's
// title.template (Next.js 16 does not apply parent templates within the same
// route segment — root layout and root page share one).
export async function generateMetadata(): Promise<Metadata> {
  const { toolCount } = await getPublicCatalogSummary();
  const n = toolCount.toLocaleString();
  return pageMetadata({
    title: `Best AI Tools Directory — Find & Compare ${n}+ AI Tools by Category`,
    description: `Discover and compare ${n}+ AI tools across 50+ categories. Browse text-to-image, video generation, coding assistants, writing tools, and more — each with features, category placement, and verified data sources.`,
    path: "/",
    absoluteTitle: true,
  });
}

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
      {/* Hero — editorial band */}
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
        <div className="container mx-auto max-w-5xl px-4 pb-14 pt-20 lg:pb-16 lg:pt-28">
          <div className="ml-stagger flex flex-col items-center text-center">
            <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              <span aria-hidden className="h-px w-10 bg-border" />
              AI tools directory
              <span aria-hidden className="h-px w-10 bg-border" />
            </p>
            <h1 className="mt-6 max-w-4xl text-balance font-serif text-5xl font-normal leading-[1.06] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-[4.5rem] lg:tracking-[-0.03em]">
              Find the <em className="italic">Best</em> AI Tools for{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span
                  aria-hidden
                  className="absolute -inset-x-2 -inset-y-1.5 -rotate-1 rounded-[0.2em] bg-highlight dark:-inset-x-1 dark:-inset-y-1"
                />
                <span className="relative z-10 text-white dark:text-emphasis-foreground">
                  Every Task
                </span>
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              AI tools by category — free &amp; paid, with real data sources.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
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
          </div>
        </div>
        {/* Data strip — hairline-separated stat cells */}
        <div className="border-t border-border/60">
          <div className="container mx-auto max-w-5xl px-4 py-4">
            <p className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="whitespace-nowrap">{toolCount.toLocaleString()}+ AI tools</span>
              <span aria-hidden className="hidden h-3 w-px bg-border sm:inline-block" />
              <span className="whitespace-nowrap">{directoryCount}+ directories</span>
              <span aria-hidden className="hidden h-3 w-px bg-border sm:inline-block" />
              <span className="whitespace-nowrap">Live records</span>
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

      {/* SEO skeleton: 分门别类罗列 — server-rendered H2/H3 with descriptions
          and internal links. Per the audit, this gives Google a category
          backbone and transmits link weight to the eight category pages. */}
      <section className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
            Browse AI Tools by Category
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Eight categories, {toolCount.toLocaleString()}+ verified AI tools across image & video, code, writing, SEO, productivity, business, e-commerce, and research.
          </p>
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {categoryCounts.map((c) => (
              <div key={c.slug}>
                <h3 className="text-base font-semibold tracking-[-0.02em]">
                  AI {c.name} Tools
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[c.slug]}
                </p>
                <Link
                  href={`/categories/${c.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground transition-colors hover:text-accent"
                >
                  Browse {c.count}+ AI {c.name} tools
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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