import type { Metadata } from "next";
import { siteName, siteDescription, siteUrl } from "@/lib/site";

export { siteUrl, siteName, siteDescription };

export interface PageMetadataInput {
  title: string;
  description?: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  /**
   * When true, the title is set with `title.absolute`, which bypasses the
   * `title.template` defined in any parent layout. Use this for pages that
   * share a route segment with the root layout (e.g. the homepage at
   * `app/page.tsx`), where Next.js 16 does not apply the parent template.
   */
  absoluteTitle?: boolean;
}

export function pageMetadata({
  title,
  description = siteDescription,
  path,
  image,
  noIndex = false,
  absoluteTitle = false,
}: PageMetadataInput): Metadata {
  const canonical = new URL(path, siteUrl).toString();
  const openGraph = {
    type: "website" as const,
    siteName,
    locale: "en_US",
    title,
    description,
    url: canonical,
    ...(image
      ? {
          images: [{ url: image, width: 1200, height: 630, alt: title }],
        }
      : {}),
  };

  return {
    ...(absoluteTitle ? { title: { absolute: title } } : { title }),
    description,
    alternates: { canonical },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
