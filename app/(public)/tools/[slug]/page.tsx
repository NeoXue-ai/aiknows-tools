import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, ExternalLink, Check, Minus } from "lucide-react";
import { ToolListView } from "@/components/tool-list-view";
import { ToolLogo } from "@/components/tool-logo";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { buttonVariants } from "@/components/ui/button";
import { categoryName, toolJsonLd } from "@/lib/seo/tool-schema";
import { getPublicToolBySlug, getPublicTools } from "@/lib/public-catalog";
import { pricingLabel } from "@/lib/tool-score";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

export async function generateStaticParams() {
  const tools = await getPublicTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };

  const description = tool.tagline ?? tool.description ?? undefined;
  return {
    title: `${tool.name} — aiknows.tools`,
    description,
    alternates: { canonical: `${siteUrl}/tools/${slug}` },
    openGraph: {
      title: `${tool.name} — aiknows.tools`,
      description,
      url: `${siteUrl}/tools/${slug}`,
      type: "website",
    },
  };
}

function relatedTools(tools: Tool[], tool: Tool, limit = 6) {
  return tools
    .filter((candidate) => candidate.primary_category === tool.primary_category && candidate.slug !== tool.slug)
    .slice(0, limit);
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) notFound();

  const related = relatedTools(await getPublicTools(), tool);
  const pricing = pricingLabel(tool.pricing_type);
  const category = categoryName(tool.primary_category);
  const jsonLd = toolJsonLd({ tool, categoryName: category, siteUrl });
  const domain = (() => {
    try {
      return new URL(tool.url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <BreadcrumbNav
        segments={[
          { label: "All tools", href: "/tools" },
          { label: category, href: `/categories/${tool.primary_category}` },
          { label: tool.name },
        ]}
      />

      {/* Screenshot hero */}
      <div className="relative aspect-[16/8] w-full overflow-hidden border border-border bg-muted">
        {tool.screenshot_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tool.screenshot_url}
            alt={`${tool.name} screenshot`}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-wider text-muted-foreground/60">
            Screenshot not recorded
          </div>
        )}
        {typeof tool.dr === "number" && (
          <span
            className="absolute right-3 top-3 rounded-md border border-border/80 bg-background/90 px-2 py-1 font-mono text-xs font-medium tabular-nums text-foreground shadow-sm backdrop-blur"
            title={`Domain Rating ${tool.dr}`}
          >
            DR {tool.dr}
          </span>
        )}
      </div>

      <header className="border-y border-border py-8 md:py-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
          Record / {category}
        </p>
        <div className="mt-5 grid gap-6 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start">
          <ToolLogo name={tool.name} logoUrl={tool.logo_url} size="xl" className="rounded-none border-border shadow-none" />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl md:text-5xl">
                {tool.name}
              </h1>
              {typeof tool.dr === "number" && (
                <span className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-sm font-medium tabular-nums text-foreground">
                  DR {tool.dr}
                </span>
              )}
            </div>
            {domain && (
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground/70">
                {domain}
              </p>
            )}
            <p className="mt-3 max-w-3xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              {tool.tagline?.trim() || "Tagline not recorded."}
            </p>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4 text-sm">
              <RecordField label="Category">{category}</RecordField>
              <RecordField label="Pricing">{pricing === "—" ? "Not recorded" : pricing}</RecordField>
              <RecordField label="Pricing detail">{tool.pricing_detail?.trim() ? "Recorded" : "Not recorded"}</RecordField>
              <RecordField label="Source">{tool.source ? "Recorded" : "Not recorded"}</RecordField>
            </dl>
          </div>

          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cn(buttonVariants({ size: "lg" }), "w-full gap-2 md:w-auto")}
          >
            Visit website
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 space-y-10">
          <section>
            <SectionLabel number="01" label="Description" />
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">What the record says</h2>
            <p className="mt-4 max-w-3xl whitespace-pre-line text-pretty leading-7 text-muted-foreground">
              {tool.description?.trim() || "Description not recorded."}
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <SectionLabel number="02" label="Recorded tags" />
            {tool.tags.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <li key={tag} className="border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Tags not recorded.</p>
            )}
          </section>

          {related.length > 0 ? (
            <section className="border-t border-border pt-8">
              <SectionLabel number="03" label="Same-category records" />
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">More records in {category}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                These entries share the same recorded primary category. They are not personalized recommendations.
              </p>
              <div className="mt-5">
                <ToolListView tools={related} />
              </div>
            </section>
          ) : null}
        </main>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="border border-border bg-card p-5">
            <SectionLabel number="Coverage" label="Record fields" />
            <h3 className="mt-3 text-sm font-medium text-foreground">What this record carries</h3>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Factual fields, not a quality rating. Checked marks mean the field is recorded for this entry.
            </p>

            <dl className="mt-5 space-y-4 text-sm">
              <RecordField label="Editorial feature" recorded={tool.is_featured} />
              <RecordField label="Recorded verification" recorded={tool.is_verified} />
              <RecordField label="Tagline" recorded={!!tool.tagline?.trim()} />
              <RecordField label="Description" recorded={!!tool.description?.trim()} />
              <RecordField label="Tags" recorded={tool.tags.length > 0} value={tool.tags.length > 0 ? `${tool.tags.length} recorded` : undefined} />
              <RecordField label="Source value" recorded={!!tool.source} value={tool.source} />
              <RecordField label="Pricing detail" recorded={!!tool.pricing_detail?.trim()} value={tool.pricing_detail?.trim()} />
              <RecordField label="Domain rating" recorded={typeof tool.dr === "number"} value={typeof tool.dr === "number" ? `DR ${tool.dr}` : undefined} />
            </dl>

            <div className="mt-5 border-t border-border pt-5">
              <Link
                href="/submit"
                className="inline-flex items-center gap-1 text-xs font-medium text-foreground transition-colors hover:text-accent"
              >
                Suggest a record update
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ number, label }: { number: string; label: string }) {
  return <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{number} / {label}</p>;
}

function RecordField({ label, recorded, value, children }: { label: string; recorded?: boolean; value?: string | null; children?: React.ReactNode }) {
  const hasChildren = children !== undefined;
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="flex items-center gap-1.5 text-sm">
        {hasChildren ? children : (
          recorded ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span className="text-foreground">{value || "Recorded"}</span>
            </>
          ) : (
            <>
              <Minus className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <span className="text-muted-foreground">Not recorded</span>
            </>
          )
        )}
      </dd>
    </div>
  );
}