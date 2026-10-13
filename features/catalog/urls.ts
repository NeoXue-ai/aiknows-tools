import type { CatalogQuery } from "./types";
export function browsePath(base: string, page: number): string {
  return page <= 1 ? base : `${base}/page/${page}`;
}
export function parseBrowsePage(value: string): number | null {
  return /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
    ? Number(value)
    : null;
}
export function searchPath(
  params: URLSearchParams,
  scope?: Pick<CatalogQuery, "category" | "subcategory">,
): string {
  const next = new URLSearchParams(params);
  if (scope?.category) next.set("category", scope.category);
  if (scope?.subcategory) next.set("subcategory", scope.subcategory);
  const query = next.toString();
  return query ? `/search?${query}` : "/search";
}
export function paginationRange(
  current: number,
  total: number,
): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const result: (number | "…")[] = [];
  for (const page of pages) {
    const last = result.at(-1);
    if (typeof last === "number" && page - last > 1) result.push("…");
    result.push(page);
  }
  return result;
}
export function legacyPaginationPath(
  pathname: string,
  params: URLSearchParams,
): string | null {
  if (pathname !== "/tools" && !/^\/categories\/[^/]+$/.test(pathname))
    return null;
  const raw = params.get("page");
  if (!raw) return null;
  const page = parseBrowsePage(raw);
  if (!page) return null;
  const next = new URLSearchParams(params);
  next.delete("page");
  const query = next.toString();
  return browsePath(pathname, page) + (query ? `?${query}` : "");
}
export function updateSearchParams(
  params: URLSearchParams,
  changes: Record<string, string | null>,
  resetPage = true,
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (resetPage) next.delete("page");
  if ("category" in changes) next.delete("subcategory");
  for (const [key, value] of Object.entries(changes)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}
