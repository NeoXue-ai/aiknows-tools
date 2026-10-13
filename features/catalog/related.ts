import type { Tool } from "./types";
const generic = new Set(["ai", "tool", "tools", "artificial-intelligence"]);
export function relatedTools(tools: Tool[], tool: Tool, limit = 6): Tool[] {
  const curated = tool.editorial?.guide?.alternatives;
  if (curated)
    return curated
      .flatMap((a) => {
        const match = tools.find((t) => t.slug === a.slug);
        return match ? [match] : [];
      })
      .slice(0, limit);
  const tags = new Set(tool.tags.filter((t) => !generic.has(t.toLowerCase())));
  return tools
    .filter((t) => t.slug !== tool.slug)
    .map((t) => ({
      tool: t,
      score:
        (tool.subcategory && t.subcategory === tool.subcategory ? 10 : 0) +
        t.tags.filter((tag) => tags.has(tag)).length * 2,
    }))
    .filter((t) => t.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || a.tool.name.localeCompare(b.tool.name, "en"),
    )
    .slice(0, limit)
    .map((t) => t.tool);
}
