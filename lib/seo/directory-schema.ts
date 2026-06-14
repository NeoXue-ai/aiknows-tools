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
    name: "Best AI Directories to Submit Your SaaS",
    description:
      "A curated list of high-DR AI directories for submitting SaaS and AI tools.",
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

  const title = `Best AI Directories to Submit Your SaaS (${new Date().getFullYear()})`;
  const description =
    "50+ high-DR AI directories to submit your AI tool. Filter by DR, link type, submission type, and listing speed.";

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