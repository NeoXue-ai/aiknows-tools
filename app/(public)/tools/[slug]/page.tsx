import { ToolGuideSections } from "@/features/catalog/components/tool-guide";
import { relatedTools } from "@/features/catalog/related";
import { buildTitle, deriveMetaDescription } from "@/features/catalog/seo";
import Link from "next/link";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, ExternalLink, Check, Minus } from "lucide-react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { ToolLogo } from "@/components/tool-logo";
import {
  categoryName,
  toolJsonLd,
  breadcrumbJsonLd,
} from "@/lib/seo/tool-schema";
import { getPublicToolBySlug, getPublicTools } from "@/features/catalog/server";
import { slugifySub } from "@/lib/subcategories";
import { type EditorialLink } from "@/lib/editorial-content";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Tool } from "@/features/catalog/types";

const R2_HOST = "pub-459c6f6553344cc393826444731f5707.r2.dev";

export async function generateStaticParams() {
  const tools = await getPublicTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };

  return pageMetadata({
    title: buildTitle(tool),
    description: deriveMetaDescription(tool),
    path: `/tools/${slug}`,
  });
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type Faq = { question: string; answer: string };

function deriveFAQs(
  tool: Tool,
  categoryLabel: string,
  domain: string | null,
): Faq[] {
  const name = tool.name;
  const tagline = tool.tagline?.trim();
  const description = tool.description?.trim();
  const pricingDetail = tool.pricing_detail?.trim();

  const faqs: Faq[] = [
    {
      question: `What is ${name}?`,
      answer:
        tagline || description || `${name} is listed under ${categoryLabel}.`,
    },
  ];
  if (pricingDetail)
    faqs.push({
      question: `What does ${name} cost?`,
      answer: `The recorded pricing model is ${pricingDetail}. Check the official website for current plans, free limits and billing terms.`,
    });
  faqs.push({
    question: `Where can I use ${name}?`,
    answer: `Visit ${domain || tool.url} using the official website link on this page. Check its supported platforms and access requirements before signing up.`,
  });
  return faqs;
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) notFound();

  const allTools = await getPublicTools();
  const related = relatedTools(allTools, tool);
  const category = categoryName(tool.primary_category);
  const domain = extractDomain(tool.url);
  const toolJsonLdBlock = toolJsonLd({ tool, categoryName: category, siteUrl });
  const breadcrumbJsonLdBlock = breadcrumbJsonLd(
    [
      { label: "All tools", href: "/tools" },
      { label: category, href: `/categories/${tool.primary_category}` },
      { label: tool.name },
    ],
    siteUrl,
  );
  const faqs = tool.editorial?.guide
    ? (tool.editorial.faqs ?? [])
    : [...deriveFAQs(tool, category, domain), ...(tool.editorial?.faqs ?? [])];
  const editorial = tool.editorial ?? null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 sm:px-8 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLdBlock).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLdBlock).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      {/* Audit P5: Google retired FAQPage rich snippets in 2026 — emitting
          FAQPage JSON-LD is now wasted signal. The on-page <details> FAQ
          stays for users; we just stop marking it up. */}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <BreadcrumbNav
          segments={[
            { label: "All tools", href: "/tools" },
            { label: category, href: `/categories/${tool.primary_category}` },
            { label: tool.name },
          ]}
        />
        <Link
          href={`/categories/${tool.primary_category}`}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-accent/30 hover:text-accent"
        >
          Browse {category}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Header — text identity on left, screenshot evidence on right */}
      <header className="mt-10 grid items-center gap-8 border-b border-border pb-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-16">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <Link
              href={`/categories/${tool.primary_category}`}
              className="text-accent transition-colors hover:text-foreground"
            >
              {category}
            </Link>
            {tool.sub && (
              <>
                <span className="text-border">/</span>
                <Link
                  href={`/categories/${slugifySub(tool.sub)}`}
                  className="transition-colors hover:text-foreground"
                >
                  {tool.sub}
                </Link>
              </>
            )}
            {domain && (
              <>
                <span className="text-border">·</span>
                <span>{domain}</span>
              </>
            )}
            {tool.is_verified && (
              <>
                <span className="text-border">·</span>
                <span className="text-accent">Verified</span>
              </>
            )}
            {tool.is_featured && (
              <>
                <span className="text-border">·</span>
                <span>Featured</span>
              </>
            )}
          </div>

          <div className="mt-5 flex min-w-0 items-center gap-4">
            <ToolLogo name={tool.name} logoUrl={tool.logo_url} size="lg" />
            <h1 className="min-w-0 text-balance text-4xl font-semibold tracking-[-0.045em] [overflow-wrap:anywhere] sm:text-5xl">
              {tool.name}
            </h1>
          </div>

          {tool.tagline?.trim() ? (
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
              {tool.tagline}
            </p>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="action-primary"
            >
              Visit website
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/submit"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Suggest an update
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Screenshot — visual evidence next to the name */}
        <figure className="min-w-0 rounded-2xl border border-border bg-card p-3">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border/60 bg-secondary">
            {tool.screenshot_url ? (
              tool.screenshot_url.includes(R2_HOST) ? (
                <Image
                  src={tool.screenshot_url}
                  alt={`${tool.name} screenshot`}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 400px"
                  className="object-cover object-top"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={tool.screenshot_url}
                  alt={`${tool.name} screenshot`}
                  fetchPriority="high"
                  className="h-full w-full object-cover object-top"
                />
              )
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-accent">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/10 bg-card text-2xl font-semibold">
                  {tool.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground">
                  Preview unavailable
                </span>
              </div>
            )}
          </div>
          <figcaption className="px-1 pb-1 pt-3 text-xs text-muted-foreground">
            Website preview
          </figcaption>
        </figure>
      </header>

      {/* 2-col grid — article + sidebar */}
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <article className="min-w-0 space-y-12">
          {/* About */}
          <section id="sec-about" className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">
              About {tool.name}
            </h2>
            <div className="mt-4 space-y-4 text-pretty leading-7 text-foreground/90">
              {tool.description?.trim() ? (
                <p className="whitespace-pre-line">{tool.description}</p>
              ) : (
                <p className="text-muted-foreground">
                  A detailed description hasn&apos;t been added yet. Visit the
                  official website to learn more about {tool.name}.
                </p>
              )}
            </div>
          </section>

          <ToolGuideSections tool={tool} tools={allTools} />

          {/* Editorial comparison — rendered only when data exists */}
          {editorial?.comparison && (
            <section id="sec-compare" className="scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  {editorial.comparison.heading}
                </h2>
                <span className="text-xs text-muted-foreground">Editorial</span>
              </div>
              <div className="mt-4 space-y-4 text-pretty leading-7 text-foreground/90">
                {editorial.comparison.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {editorial.comparison.points &&
                editorial.comparison.points.length > 0 && (
                  <ul className="mt-5 divide-y divide-border border-y border-border">
                    {editorial.comparison.points.map((pt) => (
                      <li
                        key={pt.label}
                        className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-6"
                      >
                        <span className="shrink-0 text-xs font-medium text-accent sm:w-36">
                          {pt.label}
                        </span>
                        <span className="text-sm leading-6 text-foreground/90">
                          {pt.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
            </section>
          )}

          {!!editorial?.externalLinks?.length && (
            <section id="sec-resources" className="scroll-mt-24">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                Official sources & resources
              </h2>
              <ul className="mt-4 space-y-3">
                {editorial.externalLinks.map((link: EditorialLink) => (
                  <li key={link.url} className="text-sm leading-6">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/50"
                    >
                      {link.label}
                      <ArrowUpRight className="ml-1 inline h-3 w-3 align-[-1px]" />
                    </a>
                    <span className="text-muted-foreground">
                      {" "}
                      — {link.context}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recorded fields — compact 2-col grid */}
          <section id="sec-fields" className="scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                Listing information
              </h2>
              <span className="text-xs text-muted-foreground">
                {
                  [
                    tool.is_featured && "feature",
                    tool.is_verified && "verify",
                    tool.tagline && "tagline",
                    tool.description && "description",
                    tool.tags.length > 0 && "tags",
                    tool.source && "source",
                    tool.pricing_detail && "pricing detail",
                    typeof tool.dr === "number" && "DR",
                    tool.screenshot_url && "screenshot",
                    tool.logo_url && "logo",
                  ].filter(Boolean).length
                }{" "}
                of 10 details available
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 border-y border-border sm:grid-cols-2">
              <FieldRow label="Tagline" recorded={!!tool.tagline?.trim()} />
              <FieldRow
                label="Description"
                recorded={!!tool.description?.trim()}
              />
              <FieldRow
                label="Pricing detail"
                recorded={!!tool.pricing_detail?.trim()}
              />
              <FieldRow
                label="Tags"
                recorded={tool.tags.length > 0}
                value={
                  tool.tags.length > 0
                    ? `${tool.tags.length} recorded`
                    : undefined
                }
              />
              <FieldRow label="Source" recorded={!!tool.source} />
              <FieldRow
                label="Domain rating"
                recorded={typeof tool.dr === "number"}
                value={
                  typeof tool.dr === "number" ? `DR ${tool.dr}` : undefined
                }
              />
              <FieldRow label="Logo" recorded={!!tool.logo_url} />
              <FieldRow
                label="Verification"
                recorded={tool.is_verified}
                value={tool.is_verified ? "Reviewed" : undefined}
              />
              <FieldRow
                label="Editorial feature"
                recorded={tool.is_featured}
                value={tool.is_featured ? "Featured" : undefined}
              />
              <FieldRow label="Screenshot" recorded={!!tool.screenshot_url} />
            </dl>
          </section>

          {/* FAQs */}
          <section id="sec-faq" className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-[-0.02em]">
              Common questions
            </h2>
            <div className="mt-4 border-y border-border">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group border-b border-border last:border-b-0"
                >
                  <summary className="flex cursor-pointer items-baseline justify-between gap-3 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:text-accent">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden
                      className="shrink-0 text-base text-muted-foreground/60 transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-4 pr-8 text-pretty leading-7 text-muted-foreground">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </article>

        {/* Sticky sidebar — snapshot + related */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="text-sm font-semibold text-foreground">At a glance</p>
            <dl className="mt-4 space-y-2.5 text-sm">
              <SidebarField
                label="Domain"
                value={domain ?? "Not recorded"}
                mono
              />
              {typeof tool.dr === "number" && (
                <SidebarField label="DR" value={String(tool.dr)} mono />
              )}
              <SidebarField label="Category" value={category} />
              {tool.sub && <SidebarField label="Sub" value={tool.sub} />}
              {tool.is_verified && (
                <SidebarField label="Verification" value="Reviewed" />
              )}
              {tool.is_featured && (
                <SidebarField label="Editorial" value="Featured" />
              )}
              {tool.source && (
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-xs text-muted-foreground">Source</dt>
                  <dd className="truncate text-right text-sm text-foreground">
                    {tool.source.startsWith("http") ? (
                      <a
                        href={tool.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent/50"
                      >
                        {tool.source}
                      </a>
                    ) : (
                      tool.source
                    )}
                  </dd>
                </div>
              )}
              {(() => {
                const recorded = formatDate(tool.published_at);
                return recorded ? (
                  <SidebarField label="Recorded" value={recorded} mono />
                ) : null;
              })()}
              {tool.tags.length > 0 && (
                <div className="border-t border-border pt-2.5">
                  <dt className="text-xs text-muted-foreground">Tags</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-secondary/50 px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {related.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm font-semibold text-foreground">
                Related tools
              </p>
              <ul className="mt-3 divide-y divide-border">
                {related.slice(0, 5).map((r) => (
                  <li key={r.slug} className="py-2.5 first:pt-0 last:pb-0">
                    <Link
                      href={`/tools/${r.slug}`}
                      className="group flex items-baseline justify-between gap-2"
                    >
                      <span className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-accent">
                        {r.name}
                      </span>
                      {typeof r.dr === "number" && (
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          DR {r.dr}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href={`/categories/${tool.primary_category}`}
                className="mt-3 inline-flex items-center gap-1 border-t border-border pt-3 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                See all {category} entries
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

function FieldRow({
  label,
  recorded,
  value,
}: {
  label: string;
  recorded: boolean;
  value?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-baseline gap-1.5 text-right text-sm">
        {recorded ? (
          <>
            <Check className="h-3 w-3 shrink-0 text-accent" />
            <span className="truncate text-foreground">
              {value ?? "Recorded"}
            </span>
          </>
        ) : (
          <>
            <Minus className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            <span className="text-muted-foreground">Not recorded</span>
          </>
        )}
      </dd>
    </div>
  );
}

function SidebarField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "truncate text-right text-sm text-foreground",
          mono && "tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}
