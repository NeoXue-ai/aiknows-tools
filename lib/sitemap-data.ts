import type { MetadataRoute } from "next";
import tools from "@/data/tools.json";
import { siteUrl } from "@/lib/site";

const CATEGORY_SLUGS = [
  "writing-content",
  "seo-marketing",
  "image-video",
  "code-development",
  "productivity",
  "business-analytics",
  "research-data",
  "ecommerce-sales",
] as const;

type ToolEntry = { slug: string };

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/directories`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/latest`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/submit`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = (tools as ToolEntry[]).map(
    (tool) => ({
      url: `${siteUrl}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${siteUrl}/categories/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes];
}
