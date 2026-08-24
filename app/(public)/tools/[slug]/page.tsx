import Link from "next/link";
import Image from "next/image";
import { pageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, ExternalLink, Check, Minus } from "lucide-react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { buttonVariants } from "@/components/ui/button-variants";
import {
  categoryName,
  toolJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/lib/seo/tool-schema";
import { getPublicToolBySlug, getPublicTools } from "@/lib/public-catalog";
import { pricingLabel } from "@/lib/tool-score";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

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

  const description = tool.tagline ?? tool.description ?? undefined;
  return pageMetadata({
    title: tool.name,
    description,
    path: `/tools/${slug}`,
  });
}

function relatedTools(tools: Tool[], tool: Tool, limit = 6) {
  return tools
    .filter((candidate) => candidate.primary_category === tool.primary_category && candidate.slug !== tool.slug)
    .slice(0, limit);
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

type Faq = { question: string; answer: string };

function deriveFAQs(tool: Tool, categoryLabel: string, domain: string | null): Faq[] {
  const name = tool.name;
  const tagline = tool.tagline?.trim();
  const description = tool.description?.trim();
  const pricing = pricingLabel(tool.pricing_type);
  const pricingDetail = tool.pricing_detail?.trim();

  const faqs: Faq[] = [
    {
      question: `What is ${name}?`,
      answer: tagline
        ? `${name} — ${tagline}`
        : `${name} is listed in the AIknows index under ${categoryLabel}.${description ? ` The recorded description reads: ${description}` : ""}`,
    },
    {
      question: `Which category is ${name} recorded under?`,
      answer: `${name} is recorded in the ${categoryLabel} category. Browse other entries in this category on the AIknows ${categoryLabel} index page.`,
    },
  ];

  if (pricing !== "—") {
    faqs.push({
      question: `How is ${name} priced?`,
      answer: pricingDetail
        ? `The record shows ${name} as ${pricing}. Additional pricing detail recorded: "${pricingDetail}".`
        : `The record shows ${name} as ${pricing}. No further pricing detail is recorded for this entry.`,
    });
  } else {
    faqs.push({
      question: `Is ${name} free to use?`,
      answer: `Pricing for ${name} is not recorded in the AIknows index. The recorded entry does not carry a pricing_type value. Visit the official website to check current plans.`,
    });
  }

  if (tool.is_verified) {
    faqs.push({
      question: `Is ${name} verified by AIknows?`,
      answer: `Yes — the AIknows record for ${name} carries an editorial verification flag, meaning the listing has been reviewed by the AIknows editors.`,
    });
  }

  faqs.push({
    question: `Where can I access ${name}?`,
    answer: domain
      ? `The official website for ${name} is ${domain}. Click "Visit website" on this page to open it in a new tab.`
      : `The recorded URL is ${tool.url}. Click "Visit website" on this page to open it in a new tab.`,
  });

  if (tool.tags.length > 0) {
    faqs.push({
      question: `What tags are recorded for ${name}?`,
      answer: `${tool.tags.length} tag${tool.tags.length === 1 ? " is" : "s are"} recorded for ${name}: ${tool.tags.join(", ")}. Tags are factual descriptors applied by AIknows editors; they are not popularity rankings.`,
    });
  }

  if (typeof tool.dr === "number") {
    faqs.push({
      question: `What is ${name}'s recorded domain rating?`,
      answer: `The recorded DR (Domain Rating) for ${name} is ${tool.dr}. Domain rating is a third-party authority metric — AIknows records the value but does not use it as a quality score.`,
    });
  }

  faqs.push({
    question: `Can the ${name} record be updated?`,
    answer: `Yes. The AIknows record for ${name} is evidence-led — anyone can suggest a correction via the /submit page. Submissions are reviewed by editors before changes appear in the public index.`,
  });

  return faqs;
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) notFound();

  const allTools = await getPublicTools();
  const related = relatedTools(allTools, tool);
  const pricing = pricingLabel(tool.pricing_type);
  const pricingDetail = tool.pricing_detail?.trim();
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
  const faqs = deriveFAQs(tool, category, domain);
  const faqJsonLdBlock = faqJsonLd(faqs);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(toolJsonLdBlock).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLdBlock).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLdBlock).replace(/</g, "\\u003c"),
        }}
      />

      <BreadcrumbNav
        segments={[
          { label: "All tools", href: "/tools" },
          { label: category, href: `/categories/${tool.primary_category}` },
          { label: tool.name },
        ]}
      />

      {/* Header — text identity on left, screenshot evidence on right */}
      <header className="mt-5 grid gap-6 border-b border-border pb-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/80">
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
                  href={`/categories/${tool.sub}`}
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
                <span className="text-emerald-500">Verified</span>
              </>
            )}
            {tool.is_featured && (
              <>
                <span className="text-border">·</span>
                <span>Featured</span>
              </>
            )}
          </div>

          <h1 className="mt-2 text-balance text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            {tool.name}
          </h1>

          {tool.tagline?.trim() ? (
            <p className="mt-2 max-w-2xl text-balance text-base leading-6 text-muted-foreground">
              {tool.tagline}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "sm" }), "gap-1.5")}
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
        <figure className="min-w-0 self-start">
          <div className="relative aspect-video w-full overflow-hidden border border-border bg-muted">
            {tool.screenshot_url ? (
              tool.screenshot_url.includes(R2_HOST) ? (
                <Image
                  src={tool.screenshot_url}
                  alt={`${tool.name} screenshot`}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1024px) 100vw, 288px"
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
              <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground/60">
                Screenshot not recorded
              </div>
            )}
          </div>
          <figcaption className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
            Recorded screenshot
          </figcaption>
        </figure>
      </header>

      {/* 2-col grid — article + sidebar */}
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
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
                  No long description has been recorded for {tool.name}. The
                  entry carries the tagline
                  {tool.tagline?.trim() ? ` "${tool.tagline}"` : ""} and the
                  category placement, but no editorial body. Direct knowledge
                  of this tool can be submitted to update the record.
                </p>
              )}
            </div>
          </section>

          {/* Recorded fields — compact 2-col grid */}
          <section id="sec-fields" className="scroll-mt-24">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                Recorded fields
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {[
                  tool.is_featured && "feature",
                  tool.is_verified && "verify",
                  tool.tagline && "tagline",
                  tool.description && "description",
                  tool.tags.length > 0 && "tags",
                  tool.source && "source",
                  tool.pricing_type && "pricing",
                  tool.pricing_detail && "pricing detail",
                  typeof tool.dr === "number" && "DR",
                  tool.screenshot_url && "screenshot",
                  tool.logo_url && "logo",
                ].filter(Boolean).length} / 11 recorded
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-x-8 border-y border-border sm:grid-cols-2">
              <FieldRow label="Tagline" recorded={!!tool.tagline?.trim()} />
              <FieldRow
                label="Description"
                recorded={!!tool.description?.trim()}
              />
              <FieldRow
                label="Pricing type"
                recorded={pricing !== "—"}
                value={pricing !== "—" ? pricing : undefined}
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
                <details key={faq.question} className="group border-b border-border last:border-b-0">
                  <summary className="flex cursor-pointer items-baseline justify-between gap-3 py-3.5 text-[15px] font-medium text-foreground transition-colors hover:text-accent">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden
                      className="shrink-0 font-mono text-xs text-muted-foreground/60 transition-transform group-open:rotate-45"
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
          <section className="border border-border bg-card p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
              Snapshot
            </p>
            <dl className="mt-4 space-y-2.5 text-sm">
              <SidebarField label="Domain" value={domain ?? "Not recorded"} mono />
              <SidebarField
                label="Pricing"
                value={pricing === "—" ? "Not recorded" : pricing}
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
              {tool.tags.length > 0 && (
                <div className="border-t border-border pt-2.5">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Tags
                  </dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
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
            <section className="border border-border bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">
                More in {category}
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
                        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70">
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

      {/* Hidden crawlable brand line */}
      <div className="sr-only">
        <p>
          {tool.name} is an entry in the aiknows.tools AI tools index, an
          evidence-led directory of {category.toLowerCase()} tools and other AI
          software.
        </p>
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
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <div className="flex min-w-0 items-baseline gap-1.5 text-right text-sm">
        {recorded ? (
          <>
            <Check className="h-3 w-3 shrink-0 text-emerald-500" />
            <span className="truncate text-foreground">{value ?? "Recorded"}</span>
          </>
        ) : (
          <>
            <Minus className="h-3 w-3 shrink-0 text-muted-foreground/40" />
            <span className="text-muted-foreground">Not recorded</span>
          </>
        )}
      </div>
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
      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate text-right text-sm text-foreground",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </dd>
    </div>
  );
}