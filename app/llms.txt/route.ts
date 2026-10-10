import { CATEGORIES } from "@/features/catalog/taxonomy";
import { getPublicTools } from "@/features/catalog/server";
import { siteUrl, siteDescription } from "@/lib/site";
export const dynamic = "force-static";
export async function GET(): Promise<Response> {
  const tools = await getPublicTools();
  const editorial = tools.filter((tool) => tool.editorial);
  const lines = [
    "# aiknows.tools",
    "",
    `> ${siteDescription}`,
    "",
    "## Main pages",
    `- [Home](${siteUrl}/): browse the recorded AI tool index`,
    `- [Tools](${siteUrl}/tools): ${tools.length.toLocaleString("en")} recorded entries`,
    `- [Categories](${siteUrl}/categories): ${CATEGORIES.length} top-level categories`,
    `- [About](${siteUrl}/about): editorial methodology`,
    `- [Submit](${siteUrl}/submit): suggest a tool or correction`,
    "",
    "## Top categories",
    ...CATEGORIES.map(
      (cat) =>
        `- [${cat.name}](${siteUrl}/categories/${cat.slug}): ${cat.description}`,
    ),
    "",
    "## Entries with editorial notes",
    ...editorial.map(
      (tool) =>
        `- [${tool.name}](${siteUrl}/tools/${tool.slug}): ${tool.tagline ?? "Editorial notes available"}`,
    ),
    "",
    "## Bulk discovery",
    `For a complete URL list, see ${siteUrl}/sitemap.xml`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
