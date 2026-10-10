import "server-only";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES, SUBCATEGORIES, subBySlug } from "./taxonomy";
import {
  queryTools,
  DEFAULT_QUERY,
  toToolSummary,
  toSearchText,
} from "./query";
import type {
  Category,
  Tool,
  ToolRecord,
  CatalogQuery,
  ToolSummary,
} from "./types";

interface Snapshot {
  version: string;
  indexBase: string;
  tools: ToolRecord[];
}
let memo:
  | {
      mtime: number;
      snapshot: Snapshot;
      tools: Tool[];
      bySlug: Map<string, Tool>;
      summaries: ToolSummary[];
      search: Record<string, string>;
    }
  | undefined;
function catalog() {
  const file = join(process.cwd(), ".catalog/catalog.json");
  const mtime = statSync(file).mtimeMs;
  if (!memo || memo.mtime !== mtime) {
    const snapshot = JSON.parse(readFileSync(file, "utf8")) as Snapshot;
    const tools = snapshot.tools.map((tool) => ({
      ...tool,
      sub: tool.subcategory
        ? (subBySlug(tool.subcategory)?.name ?? null)
        : null,
    }));
    memo = {
      mtime,
      snapshot,
      tools,
      summaries: tools.map(toToolSummary),
      search: Object.fromEntries(
        tools.map((tool) => [tool.slug, toSearchText(tool)]),
      ),
      bySlug: new Map(tools.map((tool) => [tool.slug, tool])),
    };
  }
  return memo;
}
export function getCatalogVersion() {
  return catalog().snapshot.indexBase;
}
export async function getPublicTools(): Promise<Tool[]> {
  return catalog().tools;
}
export async function getPublicToolBySlug(slug: string): Promise<Tool | null> {
  return catalog().bySlug.get(slug) ?? null;
}
export async function getPublicCategories(): Promise<Category[]> {
  return CATEGORIES.map((c, display_order) => ({
    ...c,
    display_order,
    description: c.description,
  }));
}
export async function getCatalogPage(query: CatalogQuery = DEFAULT_QUERY) {
  const current = catalog();
  return queryTools(current.summaries, query, current.search);
}
export function countSubs(tools: Tool[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const tool of tools)
    if (tool.sub) counts.set(tool.sub, (counts.get(tool.sub) ?? 0) + 1);
  return counts;
}
export async function getPublicSubcategories() {
  const counts = countSubs(catalog().tools);
  return SUBCATEGORIES.map((sub) => ({
    ...sub,
    count: counts.get(sub.name) ?? 0,
  }));
}
export async function getPublicCatalogSummary() {
  const tools = catalog().tools;
  return { tools, toolCount: tools.length };
}
