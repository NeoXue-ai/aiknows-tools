import { toToolSummary } from "@/features/catalog/query";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Asterisk, Code2, Image, PenLine, Workflow, BookOpen, ChartNoAxesCombined, ShoppingBag, SearchCheck } from "lucide-react";
import { pageMetadata, siteUrl } from "@/lib/seo/metadata";
import { getPublicCatalogSummary } from "@/features/catalog/server";
import { CATEGORIES, directoryItemListJsonLd } from "@/lib/seo/tool-schema";
import { HeroSearch } from "@/components/hero-search";
import { HomeToolShelf, type HomeToolSection } from "@/components/home-tool-shelf";
import type { Tool } from "@/features/catalog/types";

const STARTER_SLUGS = ["claude", "cursor", "midjourney", "chatgpt", "perplexity", "runway"];
const CATEGORY_PICKS: Record<string, string[]> = {
  "writing-content": ["notion-ai", "jasper", "grammarly", "copy-ai", "writesonic"],
  "image-video": ["midjourney", "runway", "suno", "elevenlabs", "ideogram", "pika"],
  "code-development": ["cursor", "github-copilot", "lovable", "v0", "bolt-new", "replit"],
  productivity: ["claude", "chatgpt", "n8n", "zapier", "make", "1clickclaw"],
  "research-data": ["perplexity", "notebooklm", "elicit", "consensus"],
};
const TAB_CATEGORIES = [
  { slug: "writing-content", label: "Writing" },
  { slug: "image-video", label: "Image & video" },
  { slug: "code-development", label: "Coding" },
  { slug: "productivity", label: "Productivity" },
  { slug: "research-data", label: "Research" },
];
const CATEGORY_PRESENTATION = [
  { slug: "image-video", title: "Make something visual", copy: "Images, films, and everything in between.", icon: Image },
  { slug: "code-development", title: "Bring your ideas to life", copy: "A helping hand for your next build.", icon: Code2 },
  { slug: "writing-content", title: "Find the right words", copy: "From your first draft to the final edit.", icon: PenLine },
  { slug: "productivity", title: "Make room for more", copy: "Simplify the everyday. Focus on what matters.", icon: Workflow },
  { slug: "seo-marketing", title: "Reach your audience", copy: "Thoughtful tools to help your work get seen.", icon: SearchCheck },
  { slug: "research-data", title: "Follow your curiosity", copy: "Ask better questions. Find useful answers.", icon: BookOpen },
  { slug: "business-analytics", title: "See the bigger picture", copy: "Turn your data into a clearer next step.", icon: ChartNoAxesCombined },
  { slug: "ecommerce-sales", title: "Grow your business", copy: "Tools for selling, supporting, and scaling.", icon: ShoppingBag },
];

function selectTools(tools: Tool[], slugs: string[], count = 6) {
  const selected = slugs.flatMap((slug) => {
    const tool = tools.find((item) => item.slug === slug);
    return tool ? [tool] : [];
  });
  return selected.slice(0, count).map(toToolSummary);
}

export async function generateMetadata(): Promise<Metadata> {
  const { toolCount } = await getPublicCatalogSummary();
  return pageMetadata({
    title: `Best AI Tools Directory — Find & Compare ${toolCount.toLocaleString()}+ AI Tools by Category`,
    description: `Find your next favorite AI tool. Explore ${toolCount.toLocaleString()} tools for writing, design, coding, research, and everyday work in the AIknows directory.`,
    path: "/",
    absoluteTitle: true,
  });
}

export default async function Home() {
  const { tools, toolCount } = await getPublicCatalogSummary();
  const starterTools = selectTools(tools, STARTER_SLUGS);
  const sections: HomeToolSection[] = [
    { slug: "all", label: "Start here", count: toolCount, tools: starterTools },
    ...TAB_CATEGORIES.map((category) => {
      const categoryTools = tools.filter((tool) => tool.primary_category === category.slug);
      return { ...category, count: categoryTools.length, tools: selectTools(categoryTools, CATEGORY_PICKS[category.slug] ?? []) };
    }),
  ];
  const websiteJsonLd = {
    "@context": "https://schema.org", "@type": "WebSite", name: "aiknows.tools", url: siteUrl,
    potentialAction: { "@type": "SearchAction", target: `${siteUrl}/tools?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
  const featuredListJsonLd = directoryItemListJsonLd({ tools: starterTools, siteUrl, name: "AI tools to explore", description: "A selection of AI tools for writing, design, development, and research." });

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredListJsonLd).replace(/</g, "\\u003c") }} />
      <section className="site-shell pb-14 pt-14 text-center sm:pb-16 sm:pt-20 lg:pt-[88px]" aria-labelledby="home-title">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-[11px] font-medium text-accent sm:text-xs">
          <Asterisk aria-hidden className="h-4 w-4" /> A world of tools. A little more possibility.
        </p>
        <h1 id="home-title" className="mx-auto mt-6 max-w-[800px] text-[46px] font-medium leading-[1.04] tracking-[-0.055em] sm:mt-7 sm:text-[68px] lg:text-[84px]">
          Less searching.<br />
          <span className="font-serif text-[1.13em] font-normal italic tracking-[-0.045em] text-accent">More creating.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[460px] text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-base sm:leading-7">Discover AI tools that make good work easier.<br className="hidden sm:block" /> Find the right one for your next idea.</p>
        <HeroSearch />
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground sm:mt-9 sm:text-xs">
          <span><span className="font-medium text-foreground">{toolCount.toLocaleString()}</span> tools to explore</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
          <span><span className="font-medium text-foreground">{CATEGORIES.length}</span> categories</span>
          <span aria-hidden className="h-1 w-1 rounded-full bg-border" />
          <span>An independent directory</span>
        </div>
      </section>

      <HomeToolShelf sections={sections} />

      <section className="border-y border-border bg-card/40 py-14 sm:py-20" aria-labelledby="home-categories-title">
        <div className="site-shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="section-label mb-3">Find your direction</p><h2 id="home-categories-title" className="text-2xl font-medium tracking-[-0.045em] sm:text-[32px]">What are you working on?</h2></div>
            <Link href="/categories" className="text-link">Browse categories <ArrowRight aria-hidden className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_PRESENTATION.map(({ slug, title, copy, icon: Icon }) => {
              const count = tools.filter((tool) => tool.primary_category === slug).length;
              return <Link key={slug} href={`/categories/${slug}`} className="group rounded-xl px-1 py-6 transition-colors hover:bg-secondary/60 sm:px-3">
                <div className="mb-5 flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-accent"><Icon aria-hidden className="h-5 w-5" strokeWidth={1.6} /></span><ArrowRight aria-hidden className="h-4 w-4 text-muted-foreground/50 transition-[color,transform] group-hover:translate-x-1 group-hover:text-accent" /></div>
                <h3 className="text-[15px] font-medium tracking-[-0.02em]">{title}</h3><p className="mt-2 min-h-10 text-[13px] leading-5 text-muted-foreground">{copy}</p><p className="mt-4 text-xs text-muted-foreground">{count.toLocaleString()} tools <span aria-hidden>↗</span></p>
              </Link>;
            })}
          </div>
        </div>
      </section>

      <section className="site-shell py-14 sm:py-20" aria-labelledby="home-submit-title">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[24px] border border-border bg-emphasis px-7 py-9 sm:px-12 sm:py-12 md:flex-row md:items-center">
          <div><p className="mb-3 text-xs font-medium text-emphasis-foreground">For the people building what’s next</p><h2 id="home-submit-title" className="text-2xl font-medium tracking-[-0.04em] sm:text-[32px]">Made something useful?</h2><p className="mt-3 max-w-md text-sm leading-6 text-foreground/80">Give your AI tool a place to be discovered.<br className="hidden sm:block" /> Share it with curious minds and thoughtful makers.</p></div>
          <Link href="/submit" className="action-primary shrink-0">Submit your tool <ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
