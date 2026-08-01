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
import { ToolCardCompact } from "@/components/ToolCardCompact";
import { ScrollReveal } from "@/components/scroll-reveal";
import { getPublicCatalogSummary } from "@/lib/public-catalog";
import { CATEGORIES, categoryName, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

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

export const metadata = pageMetadata({
  title: "AI tool discovery index",
  path: "/",
});

function pricingBadge(type: Tool["pricing_type"]): { label: string; dot: string } | null {
  switch (type) {
    case "free":
      return { label: "Free", dot: "bg-emerald-500" };
    case "freemium":
      return { label: "Freemium", dot: "bg-amber-500" };
    case "paid":
      return { label: "Paid", dot: "bg-accent" };
    case "enterprise":
      return { label: "Enterprise", dot: "bg-violet-500" };
    default:
      return null;
  }
}

export default async function Home() {
  const { tools, toolCount, directoryCount } = await getPublicCatalogSummary();
  const featured = tools.slice(0, 6);

  const categoryCounts = CATEGORIES.map((c) => ({
    ...c,
    count: tools.filter((t) => t.primary_category === c.slug).length,
  }));

  const samples = tools.slice(0, 4);
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
    tools: featured,
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
      {/* Hero — asymmetric: left thesis, right index snapshot */}
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
        <div className="container mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16 lg:py-28">
          {/* Left: thesis */}
          <div className="flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              AI tool discovery platform
            </p>
            <h1 className="mt-5 text-balance font-serif text-5xl font-normal leading-[1.02] tracking-[-0.025em] text-foreground sm:text-6xl lg:text-[5rem] lg:tracking-[-0.035em]">
              Discover the Future of AI
            </h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              Explore the best AI tools, products, and startups shaping the future.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
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

          {/* Right: index snapshot */}
          <aside className="flex flex-col self-stretch">
            <div className="flex items-baseline justify-between border-b border-border pb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Index snapshot
              </span>
              <Link
                href="/tools"
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-accent"
              >
                Browse →
              </Link>
            </div>
            <ol className="flex flex-1 flex-col">
              {samples.map((t, i) => {
                const pricing = pricingBadge(t.pricing_type);
                return (
                  <li
                    key={t.id || t.slug}
                    className="group/row border-b border-border last:border-b-0"
                  >
                    <Link
                      href={`/tools/${t.slug}`}
                      className="-mx-2 flex items-center gap-4 rounded-md px-2 py-4 transition-colors hover:bg-secondary/30"
                    >
                      <span className="w-8 shrink-0 font-serif text-[18px] italic leading-none tabular-nums text-muted-foreground transition-colors group-hover/row:text-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-medium text-foreground transition-colors group-hover/row:text-accent">
                          {t.name}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {categoryName(t.primary_category)}
                          {pricing && (
                            <>
                              <span aria-hidden className="mx-2 text-border">·</span>
                              <span className="inline-flex items-center gap-1">
                                <span
                                  aria-hidden
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    pricing.dot,
                                  )}
                                />
                                {pricing.label}
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </aside>
        </div>
      </section>

      {/* What this index records */}
      <ScrollReveal>
      <section className="border-b border-border">
        <div className="container mx-auto max-w-7xl px-4 py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                How to read the index
              </p>
              <h2 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                An evidence-led map, not a popularity ranking.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                Each record states what is captured, what is missing, and what is not measured. No claims of review, ranking, or popularity unless the data carries them.
              </p>
            </div>
            <dl className="divide-y divide-border border-y border-border">
              {[
                {
                  label: "Identity",
                  detail: "Name, primary category, tagline, and a working URL.",
                },
                {
                  label: "Pricing state",
                  detail: "Free · Freemium · Paid · Enterprise, with detail when recorded.",
                },
                {
                  label: "Description & tags",
                  detail: "Description depth and tag coverage drive the evidence score.",
                },
                {
                  label: "Recorded source",
                  detail: "Where the record originated, when present. Not a verification.",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6"
                >
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="text-sm leading-6 text-foreground/85">
                    {row.detail}
                  </dd>
                </div>
              ))}
            </dl>
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
            {featured.map((tool) => (
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