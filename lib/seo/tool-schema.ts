import type { Tool, ToolSummary } from "@/features/catalog/types";
import { deriveMetaDescription } from "@/features/catalog/seo";
export { CATEGORIES, categoryName } from "@/features/catalog/taxonomy";

export interface ToolJsonLdInput {
  tool: Tool;
  categoryName: string;
  siteUrl: string;
}

export function toolJsonLd({ tool, categoryName, siteUrl }: ToolJsonLdInput) {
  const categories: Record<string, string> = {
    "code-development": "DeveloperApplication",
    "image-video": "MultimediaApplication",
    "writing-content": "BusinessApplication",
    productivity: "BusinessApplication",
    "research-data": "ReferenceApplication",
    "ecommerce-sales": "BusinessApplication",
    "seo-marketing": "BusinessApplication",
    "business-analytics": "BusinessApplication",
  };
  const platforms = tool.editorial?.guide?.platforms ?? [];
  const operatingSystems = [
    "Windows",
    "macOS",
    "Linux",
    "iOS",
    "iPadOS",
    "Android",
  ].filter((os) =>
    platforms.some((platform) => new RegExp(`\\b${os}\\b`).test(platform)),
  );
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/tools/${tool.slug}#software`,
    name: tool.name,
    url: tool.url,
    applicationCategory:
      categories[tool.primary_category] ?? "UtilitiesApplication",
    ...(operatingSystems.length
      ? { operatingSystem: operatingSystems.join(", ") }
      : {}),
    description: deriveMetaDescription(tool),
  };
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
      ...(segment.href ? { item: `${baseUrl}${segment.href}` } : {}),
    })),
  };
}

// FAQPage schema removed — Google retired FAQPage rich snippets in 2026
// (audit P5). On-page FAQ UIs (tool dossier + /faq) still render the Q&A
// for human readers; we just no longer mark it up.
