import type {
  CatalogQuery,
  CatalogPage,
  ToolRecord,
  ToolSummary,
} from "./types";
import { categoryName } from "./taxonomy";
export const PAGE_SIZE = 24;
export const DEFAULT_QUERY: CatalogQuery = {
  q: "",
  sort: "time",
  dir: "desc",
  page: 1,
};
export function toSearchText(tool: ToolRecord): string {
  return [tool.description, ...tool.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
export function toToolSummary(tool: ToolRecord): ToolSummary {
  return {
    slug: tool.slug,
    name: tool.name,
    tagline: tool.tagline || tool.description?.slice(0, 240) || null,
    url: tool.url,
    logo_url: tool.logo_url,
    screenshot_url: tool.screenshot_url,
    primary_category: tool.primary_category,
    subcategory: tool.subcategory,
    pricing_detail: tool.pricing_detail,
    source: tool.source,
    dr: tool.dr,
    published_at: tool.published_at,
  };
}
export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  const sort = params.get("sort");
  const sortKey = sort === "name" || sort === "dr" ? sort : "time";
  const dir = params.get("dir");
  const page = params.get("page") ?? "1";
  return {
    q: (params.get("q") ?? "").trim(),
    category: params.get("category") || undefined,
    sort: sortKey,
    dir:
      dir === "asc" || dir === "desc"
        ? dir
        : sortKey === "name"
          ? "asc"
          : "desc",
    page:
      /^[1-9]\d*$/.test(page) && Number.isSafeInteger(Number(page))
        ? Number(page)
        : 1,
  };
}
export function queryTools(
  tools: ToolSummary[],
  query: CatalogQuery,
  search: Record<string, string> = {},
  pageSize = PAGE_SIZE,
): CatalogPage {
  const q = query.q.trim().toLowerCase();
  const selected = tools.filter(
    (t) =>
      (!query.category || t.primary_category === query.category) &&
      (!query.subcategory || t.subcategory === query.subcategory) &&
      (!q ||
        [t.name, t.tagline, categoryName(t.primary_category), search[t.slug]]
          .join(" ")
          .toLowerCase()
          .includes(q)),
  );
  selected.sort((a, b) => {
    if (query.sort === "name")
      return (
        (query.dir === "asc" ? 1 : -1) *
        (a.name.localeCompare(b.name, "en") ||
          a.slug.localeCompare(b.slug, "en"))
      );
    if (query.sort === "dr") {
      if ((a.dr === null) !== (b.dr === null)) return a.dr === null ? 1 : -1;
      const diff = (a.dr ?? 0) - (b.dr ?? 0);
      if (diff) return query.dir === "asc" ? diff : -diff;
    } else {
      const diff =
        (a.published_at ? Date.parse(a.published_at) : 0) -
        (b.published_at ? Date.parse(b.published_at) : 0);
      if (diff) return query.dir === "asc" ? diff : -diff;
    }
    return (
      a.name.localeCompare(b.name, "en") || a.slug.localeCompare(b.slug, "en")
    );
  });
  const totalPages = Math.max(1, Math.ceil(selected.length / pageSize));
  const page = Math.min(Math.max(1, query.page), totalPages);
  return {
    items: selected.slice((page - 1) * pageSize, page * pageSize),
    total: selected.length,
    page,
    totalPages,
  };
}
