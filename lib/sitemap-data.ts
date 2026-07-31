import type { MetadataRoute } from "next";
import { getPublicSubcategories, getPublicTools } from "@/lib/public-catalog";
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

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const tools = await getPublicTools();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, priority: 1.0 },
    { url: `${siteUrl}/tools`, priority: 0.8 },
    { url: `${siteUrl}/categories`, priority: 0.8 },
    { url: `${siteUrl}/directories`, priority: 0.9 },
    { url: `${siteUrl}/submit`, priority: 0.5 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${siteUrl}/categories/${slug}`,
    priority: 0.7,
  }));

  const subs = await getPublicSubcategories();
  const subRoutes: MetadataRoute.Sitemap = subs.map((sub) => ({
    url: `${siteUrl}/categories/${sub.slug}`,
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes, ...subRoutes];
}
