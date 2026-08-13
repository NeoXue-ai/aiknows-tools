import type { MetadataRoute } from "next";
import { getPublicSubcategories, getPublicTools } from "@/lib/public-catalog";
import { CATEGORIES } from "@/lib/seo/tool-schema";
import { siteUrl } from "@/lib/site";

export async function getSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const tools = await getPublicTools();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, priority: 1.0 },
    { url: `${siteUrl}/tools`, priority: 0.8 },
    { url: `${siteUrl}/categories`, priority: 0.8 },
    { url: `${siteUrl}/blog`, priority: 0.6 },
    { url: `${siteUrl}/pricing`, priority: 0.5 },
    { url: `${siteUrl}/collections`, priority: 0.6 },
    { url: `${siteUrl}/submit`, priority: 0.5 },
    { url: `${siteUrl}/about`, priority: 0.4 },
    { url: `${siteUrl}/faq`, priority: 0.4 },
    { url: `${siteUrl}/contact`, priority: 0.4 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${siteUrl}/tools/${tool.slug}`,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    priority: 0.7,
  }));

  const subs = await getPublicSubcategories();
  const subRoutes: MetadataRoute.Sitemap = subs
    .filter((sub) => sub.count > 0)
    .map((sub) => ({
      url: `${siteUrl}/categories/${sub.slug}`,
      priority: 0.6,
    }));

  return [...staticRoutes, ...toolRoutes, ...categoryRoutes, ...subRoutes];
}
