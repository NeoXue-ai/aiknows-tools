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
} from "@/lib/seo/tool-schema";
import { getPublicToolBySlug, getPublicTools } from "@/lib/public-catalog";
import {
  getEditorial,
  editorialFaqs,
  type EditorialLink,
} from "@/lib/editorial-content";
import { siteUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

const R2_HOST = "pub-459c6f6553344cc393826444731f5707.r2.dev";

export async function generateStaticParams() {
  const tools = await getPublicTools();
  return tools.map((tool) => ({ slug: tool.slug }));
}

type Props = { params: Promise<{ slug: string }> };

// SEO: titles must survive Google's ~60-char truncation, so the whole title
// (brand + hint) is budgeted rather than the hint alone. The catalog is machine
// scraped — taglines carry markdown, URLs, emoji and their own tool name — so
// every source is normalized before it reaches the <title>.
const TITLE_BUDGET = 60;
const TITLE_SEP = " — ";

const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu;

const COPULA_RE = /^(?:is|are|was|were|has|have|had)\b[\s,]*/i;
const VERB_RE =
  /^(?:is|are|was|were|has|have|had|provides?|offers?|helps?|lets?|allows?|generates?|creates?|makes?|builds?|turns?|converts?|brings?|gives?|delivers?|powers?|enables?)\b[\s,]*/i;
const DETERMINER_RE =
  /^(?:a|an|the|any|all|each|every|some|many|your|their|his|her|its|our|my|more|better|new|free|you|us|me|them|one|two|three)\b/i;
const LEAD_ARTICLE_RE = /^(?:a|an|the)\s+/i;
const LEAD_PREP_RE = /^(?:with|from|by|on|via|using|through|for)\s+[^,]{1,40},\s*/i;
const DANGLING_RE =
  /\s+(?:is|are|was|were|be|been|to|for|with|and|or|of|in|on|at|by|from|as|that|which|the|a|an|your|its|this|these|it|&|,|-|–|—|:)\s*$/i;
const GAP_RE =
  /(?:^|\s)(?:your|my|our|its|his|her|the|a|an)\s+(?:for|with|and|or|to|in|on|of|at|by|from)\b/i;
// Some rows store a whole SEO title in `name` ("Fansloader — Free OnlyFans Downloader").
const NAME_SPLIT_RE = /^(.+?)(?:\s*[—–-]\s+|\s*\|\s+|\s*:\s+|\s*,\s+)(.+)$/;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Copy often drops the spaces in the brand ("TankBlaster" vs "Tank Blaster").
// The lookahead below stops this from matching inside longer words.
function looseRe(name: string): string {
  return name.split(/\s+/).map(escapeRe).join("\\s*");
}

function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:3[49]|x27);/gi, "'")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(EMOJI_RE, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/(?<!\w)[*_](?=\S)|(?=\S)[*_](?!\w)|(?<=\S)[*_](?!\w)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const letterCount = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "").length;

const trimTail = (s: string) =>
  s.replace(/[.!?]+\s*$/, "").replace(/[\s,;:.\-–—]+$/, "").trim();

function stripName(src: string, name: string): string {
  if (!name) return src;
  const loose = looseRe(name);
  const possessive = new RegExp(
    `([^\\p{L}\\p{N}])${loose}['’]s(?=$|[^\\p{L}\\p{N}])`,
    "giu",
  );
  const plain = new RegExp(
    `(^|[^\\p{L}\\p{N}])${loose}['’]?(?:s|re)?[?!:;.,]?(?=$|[^\\p{L}\\p{N}])`,
    "giu",
  );
  let out = src.replace(possessive, "$1its").replace(plain, "$1");
  for (let i = 0; i < 2; i++) {
    const next = out.replace(plain, "$1");
    if (next === out) break;
    out = next;
  }
  out = out
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:.\-–—'"’]+/, "")
    .trim();
  // "Take your eye test online" -> "Take your for free" reads broken; keep the original.
  if (GAP_RE.test(out) && !GAP_RE.test(src)) return src;
  return out;
}

function prepareHint(sentence: string, name: string): string {
  const labeled = sentence.replace(
    /^(?:what it is|what it does|about|overview|features?|description)\s*[:\-—–]?\s*/i,
    "",
  );
  const nameLed =
    !!name && !!labeled.trim().match(new RegExp(`^${looseRe(name)}`, "i"));

  const segments = labeled
    .split(/\s+[—–]\s+|\s+-\s+/)
    .map((p) => stripName(p, name))
    .filter((p) => letterCount(p) >= 12);
  const pool = segments.length ? segments.join(". ") : labeled;

  // Brand glued to extra letters in the copy: "Chatterbox Turbo", "SajuGPTAI는".
  let base = pool;
  if (name.length >= 4) {
    const lead = pool.match(new RegExp(`^${looseRe(name)}`, "i"));
    const glued = lead && pool.charAt(lead[0].length);
    if (lead && glued && /[\p{L}\p{N}]/u.test(glued)) {
      base = pool.slice(lead[0].length).replace(/^[^\p{L}\p{N}]+/u, "").trim();
    }
  }
  base = stripName(base, name).replace(LEAD_PREP_RE, "").trim();

  let hint = base;
  let strippedVerb = false;
  for (let i = 0; i < 3; i++) {
    const m = hint.match(nameLed ? COPULA_RE : VERB_RE);
    if (!m) break;
    const rest = hint.slice(m[0].length);
    if (!COPULA_RE.test(m[0]) && DETERMINER_RE.test(rest)) break;
    hint = rest.trim();
    strippedVerb = true;
  }
  if (strippedVerb) hint = hint.replace(LEAD_ARTICLE_RE, "").trim();
  for (let i = 0; i < 2; i++) {
    const next = hint.replace(DANGLING_RE, "").trimEnd();
    if (next === hint) break;
    hint = next;
  }
  return trimTail(hint);
}

function clampHint(hint: string, budget: number, name: string): string {
  hint = trimTail(hint);
  if (hint.length <= budget) return hint;
  const cut = hint.slice(0, budget - 1);
  const lastSpace = cut.lastIndexOf(" ");
  let out = (lastSpace > budget * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd();
  for (let i = 0; i < 3; i++) {
    const withoutName = name
      ? out.replace(new RegExp(`\\s+${escapeRe(name)}['’]?$`, "i"), "")
      : out;
    const next = withoutName.replace(DANGLING_RE, "").trimEnd();
    if (next === out) break;
    out = next;
  }
  return out + "…";
}

function deriveFunctionHint(tool: Tool, name: string, budget: number): string {
  const src = cleanText(tool.tagline) || cleanText(tool.description);
  if (!src) return cleanText(tool.sub) || "AI Tool";

  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  let hint = "";
  for (const sentence of sentences.slice(0, 3)) {
    const candidate = prepareHint(sentence, name);
    // "Bored with scrolling?" is a marketing hook, not a description.
    const isHook = candidate.length < 28 && /[?!]\s*$/.test(sentence);
    if (letterCount(candidate) >= 12 && !isHook) {
      hint = candidate;
      break;
    }
    hint = hint || candidate;
  }
  if (letterCount(hint) < 12) hint = cleanText(tool.sub) || "AI Tool";
  return clampHint(hint[0].toUpperCase() + hint.slice(1), budget, name);
}

function buildTitle(tool: Tool): string {
  const full = cleanText(tool.name);
  if (!full) {
    const src = cleanText(tool.tagline) || cleanText(tool.description);
    if (!src) return cleanText(tool.sub) || "aiknows.tools";
    return clampHint(deriveFunctionHint(tool, "", TITLE_BUDGET), TITLE_BUDGET, "");
  }

  const split = full.match(NAME_SPLIT_RE);
  const head =
    split && letterCount(split[1]) >= 4 && letterCount(split[2]) >= 8
      ? split[1].trim()
      : full;
  const tail = head === full ? "" : split![2].trim();

  if (head.length + TITLE_SEP.length >= TITLE_BUDGET) return head;
  const budget = TITLE_BUDGET - head.length - TITLE_SEP.length;

  let hint = "";
  if (tail) {
    const clauses = stripName(tail, head).split(/\s+[—–|]\s+/);
    const chosen = trimTail(clauses.find((c) => letterCount(c) >= 12) ?? clauses[0]);
    if (chosen) {
      const candidate = clampHint(
        chosen[0].toUpperCase() + chosen.slice(1),
        budget,
        head,
      );
      if (letterCount(candidate.replace(/…$/, "")) >= 12) hint = candidate;
    }
  }
  if (!hint) hint = deriveFunctionHint(tool, head, budget);
  if (!hint || head.toLowerCase() === hint.toLowerCase()) return head;
  return `${head}${TITLE_SEP}${hint}`;
}

function deriveMetaDescription(tool: Tool): string {
  const trailing =
    " Listed on aiknows.tools — see source, recorded evidence, and editorial notes.";
  const budget = 158 - trailing.length;
  const source =
    cleanText(tool.tagline) || cleanText(tool.description) || cleanText(tool.sub);
  if (!source) {
    return `${tool.name} is recorded in the AIknows.tools index.`;
  }
  const head =
    source.length <= budget
      ? source
      : source.slice(0, budget - 1).replace(DANGLING_RE, "").trimEnd() + "…";
  return head + trailing;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getPublicToolBySlug(slug);
  if (!tool) return { title: "Tool not found" };

  return pageMetadata({
    title: buildTitle(tool),
    description: deriveMetaDescription(tool),
    path: `/tools/${slug}`,
    absoluteTitle: true,
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

  if (pricingDetail) {
    faqs.push({
      question: `Is ${name} free to use?`,
      answer: `Editor's note on ${name}: ${pricingDetail}. For current plans and pricing, visit the official website.`,
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
  const faqs = [...deriveFAQs(tool, category, domain), ...editorialFaqs(tool)];
  const editorial = getEditorial(slug);

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
          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent"
        >
          Browse {category}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

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

          {/* Editorial comparison — rendered only when data exists */}
          {editorial?.comparison && (
            <section id="sec-compare" className="scroll-mt-24">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-[-0.02em]">
                  {editorial.comparison.heading}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  Editorial
                </span>
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
                        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-accent sm:w-36">
                          {pt.label}
                        </span>
                        <span className="text-sm leading-6 text-foreground/90">
                          {pt.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              {editorial.externalLinks &&
                editorial.externalLinks.length > 0 && (
                  <div className="mt-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      Related resources
                    </p>
                    <ul className="mt-2.5 space-y-1.5">
                      {editorial.externalLinks.map((link: EditorialLink) => (
                        <li key={link.url} className="text-sm leading-6">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener"
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
                  </div>
                )}
            </section>
          )}

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
                  tool.pricing_detail && "pricing detail",
                  typeof tool.dr === "number" && "DR",
                  tool.screenshot_url && "screenshot",
                  tool.logo_url && "logo",
                ].filter(Boolean).length} / 10 recorded
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
                  <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    Source
                  </dt>
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
                const recorded = formatDate(tool.published_at || tool.created_at);
                return recorded ? (
                  <SidebarField label="Recorded" value={recorded} mono />
                ) : null;
              })()}
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

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}