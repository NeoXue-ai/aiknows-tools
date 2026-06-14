import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/sitemap-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries();
}
