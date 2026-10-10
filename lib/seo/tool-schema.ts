import type { Tool, ToolSummary } from "@/features/catalog/types";
export { CATEGORIES, categoryName } from "@/features/catalog/taxonomy";

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
  tools: Pick<ToolSummary, "slug" | "name">[];
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

// FAQPage schema removed — Google retired FAQPage rich snippets in 2026
// (audit P5). On-page FAQ UIs (tool dossier + /faq) still render the Q&A
// for human readers; we just no longer mark it up.

