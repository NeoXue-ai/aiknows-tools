import type { Category, Tool } from "@/lib/supabase/types";

export const CATEGORIES: Pick<Category, "slug" | "name">[] = [
  { slug: "writing-content", name: "Writing & Content" },
  { slug: "seo-marketing", name: "SEO & Marketing" },
  { slug: "image-video", name: "Image & Video" },
  { slug: "code-development", name: "Code & Development" },
  { slug: "productivity", name: "Productivity & Automation" },
  { slug: "business-analytics", name: "Business & Analytics" },
  { slug: "ecommerce-sales", name: "E-commerce & Sales" },
  { slug: "research-data", name: "Research & Data" },
];

const CATEGORY_NAME_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

export function categoryName(slug: string): string {
  return CATEGORY_NAME_BY_SLUG.get(slug) ?? slug;
}

function parsePrice(detail: string | null): number | null {
  if (!detail) return null;
  const match = detail.match(/\$([\d,]+(?:\.\d+)?)/);
  if (!match) return null;
  const n = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export interface ToolJsonLdInput {
  tool: Tool;
  categoryName: string;
  siteUrl: string;
}

export function toolJsonLd({
  tool,
  categoryName,
  siteUrl,
}: ToolJsonLdInput) {
  const price = parsePrice(tool.pricing_detail);
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: tool.url,
    applicationCategory: categoryName,
    operatingSystem: "Web",
    description: tool.tagline ?? tool.description ?? undefined,
  };
  if (price !== null) {
    jsonLd.offers = {
      "@type": "Offer",
      price,
      priceCurrency: "USD",
    };
  }
  return jsonLd;
}

export interface DirectoryItemListInput {
  tools: Tool[];
  siteUrl: string;
  name: string;
  description: string;
}

export function directoryItemListJsonLd({
  tools,
  siteUrl,
  name,
  description,
}: DirectoryItemListInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/tools/${tool.slug}`,
      name: tool.name,
    })),
  };
}

export function breadcrumbJsonLd(
  segments: { label: string; href?: string }[],
  siteUrl: string,
) {
  const baseUrl = siteUrl.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: segment.label,
      ...(segment.href
        ? { item: `${baseUrl}${segment.href}` }
        : {}),
    })),
  };
}

export function faqJsonLd(
  faqs: { question: string; answer: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

