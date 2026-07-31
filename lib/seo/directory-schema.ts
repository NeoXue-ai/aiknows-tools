import type { Metadata } from "next";
import type { Directory } from "@/lib/supabase/types";

export function directoryItemListJsonLd(
  directories: Directory[],
  siteUrl: string,
) {
  const baseUrl = siteUrl.replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Submitted directory records",
    description:
      "Recorded submission facts for AI and SaaS directories: domain rating, submission type, link type, listing speed, and recorded check dates.",
    url: `${baseUrl}/directories`,
    numberOfItems: directories.length,
    itemListElement: directories.map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.name,
      url: d.url,
      description: d.niche_focus ?? d.notes ?? null,
    })),
  };
}

export function directoryPageMetadata(siteUrl?: string): Metadata {
  const baseUrl = (siteUrl ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000").replace(/\/$/, "");

  const title = `Submitted directory records — aiknows.tools`;
  const description =
    "Recorded submission facts: domain rating, submission type, link type, listing speed, niche, submit URL, and recorded check dates.";

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/directories`,
    },
    openGraph: {
      type: "website",
      url: `${baseUrl}/directories`,
      title,
      description,
      siteName: "aiknows.tools",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}