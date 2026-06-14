import type { Metadata } from "next";
import { siteName, siteDescription, siteUrl } from "@/lib/site";

export { siteUrl, siteName, siteDescription };

export const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  siteName,
  locale: "en_US",
  images: [
    {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: `${siteName} — ${siteDescription}`,
    },
  ],
};

export const defaultTwitter: Metadata["twitter"] = {
  card: "summary_large_image",
  site: "@aiknows",
  images: ["/opengraph-image"],
};

export interface PageMetadataInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetadataInput): Metadata {
  const canonical = `${siteUrl}${path}`;
  const resolvedDescription = description ?? siteDescription;
  const resolvedImage = image ?? "/opengraph-image";

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical,
    },
    openGraph: {
      ...defaultOpenGraph,
      title,
      description: resolvedDescription,
      url: canonical,
      images: [
        {
          url: resolvedImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      ...defaultTwitter,
      title,
      description: resolvedDescription,
      images: [resolvedImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
