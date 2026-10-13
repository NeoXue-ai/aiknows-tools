import type { ToolRecord } from "./types";
import { CATEGORIES, subBySlug } from "./taxonomy";
const fields = new Set([
  "slug",
  "name",
  "tagline",
  "description",
  "url",
  "logo_url",
  "screenshot_url",
  "primary_category",
  "subcategory",
  "tags",
  "pricing_detail",
  "source",
  "dr",
  "is_featured",
  "is_verified",
  "published_at",
  "editorial",
]);
function record(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Expected an object");
  return input as Record<string, unknown>;
}
function text(value: unknown, label: string): asserts value is string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${label} must be non-empty text`);
}
export function validateUrl(value: unknown): asserts value is string {
  text(value, "URL");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  )
    throw new Error(`Invalid URL: ${value}`);
}
export function canonicalWebsite(value: string): string {
  const url = new URL(value);
  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  url.hash = "";
  for (const key of [...url.searchParams.keys()])
    if (/^utm_|^(ref|source)$/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  return url.toString().replace(/\/$/, "");
}
function validateEditorial(input: unknown) {
  const entry = record(input);
  for (const key of Object.keys(entry))
    if (!["comparison", "faqs", "externalLinks", "guide", "seo"].includes(key))
      throw new Error(`Unknown editorial field: ${key}`);
  if (entry.seo !== undefined) {
    const seo = record(entry.seo);
    for (const key of Object.keys(seo))
      if (!["title", "description"].includes(key))
        throw new Error(`Unknown SEO field: ${key}`);
    for (const key of ["title", "description"]) {
      const value = seo[key];
      text(value, `SEO ${key}`);
      if (
        /<[^>]+>|&lt;.*?&gt;|\[[^\]]*\]\([^)]*\)|\*\*|__|`|(?:^|\s)[*_]\S[^*_]*[*_](?=\W|$)|^\s*(?:#{1,6}\s|>\s|[-*+]\s)|[\u0000-\u001f\u007f]/i.test(
          value,
        )
      )
        throw new Error(`SEO ${key} must be plain text`);
      if (/…|\.{3}/.test(value))
        throw new Error(`SEO ${key} must not contain truncated copy`);
    }
  }
  if (entry.guide !== undefined) {
    const guide = record(entry.guide);
    const keys = [
      "checkedAt",
      "features",
      "useCases",
      "limitations",
      "platforms",
      "pricingNote",
      "pricingUrl",
      "alternatives",
      "sources",
    ];
    for (const key of Object.keys(guide))
      if (!keys.includes(key)) throw new Error(`Unknown guide field: ${key}`);
    if (
      typeof guide.checkedAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(guide.checkedAt) ||
      !isPublicationDate(`${guide.checkedAt}T00:00:00Z`)
    )
      throw new Error("Invalid guide checked date");
    for (const key of ["features", "useCases", "alternatives", "sources"])
      if (!Array.isArray(guide[key]) || !guide[key].length)
        throw new Error(`${key} must be a non-empty array`);
    validateItems(guide.features, ["label", "text"]);
    validateItems(guide.useCases, ["label", "text"]);
    validateItems(guide.alternatives, ["slug", "reason"]);
    validateItems(guide.sources, ["label", "url"], true);
    for (const key of ["limitations", "platforms"]) {
      if (!Array.isArray(guide[key]) || !guide[key].length)
        throw new Error(`${key} must be a non-empty array`);
      guide[key].forEach((value: unknown) => text(value, key));
    }
    text(guide.pricingNote, "pricing note");
    validateUrl(guide.pricingUrl);
  }
  if (entry.comparison !== undefined) {
    const c = record(entry.comparison);
    for (const key of Object.keys(c))
      if (!["eyebrow", "heading", "paragraphs", "points"].includes(key))
        throw new Error(`Unknown comparison field: ${key}`);
    text(c.eyebrow, "eyebrow");
    text(c.heading, "heading");
    if (!Array.isArray(c.paragraphs))
      throw new Error("paragraphs must be an array");
    c.paragraphs.forEach((x) => text(x, "paragraph"));
    if (c.points !== undefined) validateItems(c.points, ["label", "text"]);
  }
  if (entry.faqs !== undefined)
    validateItems(entry.faqs, ["question", "answer"]);
  if (entry.externalLinks !== undefined)
    validateItems(entry.externalLinks, ["label", "url", "context"], true);
}
function validateItems(input: unknown, keys: string[], urls = false) {
  if (!Array.isArray(input))
    throw new Error("Editorial items must be an array");
  for (const item of input) {
    const row = record(item);
    for (const key of Object.keys(row))
      if (!keys.includes(key))
        throw new Error(`Unknown editorial item field: ${key}`);
    keys.forEach((key) => text(row[key], key));
    if (urls) validateUrl(row.url);
  }
}
function isPublicationDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/,
  );
  if (!match || !Number.isFinite(Date.parse(value))) return false;
  const [year, month, day, hour, minute, second] = match
    .slice(1, 7)
    .map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > days[month - 1] ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  )
    return false;
  const zone = match[7];
  return (
    zone === "Z" ||
    (Number(zone.slice(1, 3)) <= 14 &&
      Number(zone.slice(4, 6)) < 60 &&
      (Number(zone.slice(1, 3)) !== 14 || Number(zone.slice(4, 6)) === 0))
  );
}
export function validateTool(input: unknown): ToolRecord {
  const tool = record(input);
  for (const key of Object.keys(tool))
    if (!fields.has(key)) throw new Error(`Unknown field: ${key}`);
  text(tool.slug, "slug");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tool.slug))
    throw new Error(`Invalid slug: ${tool.slug}`);
  text(tool.name, "name");
  validateUrl(tool.url);
  if (!CATEGORIES.some((c) => c.slug === tool.primary_category))
    throw new Error(`Unknown category: ${tool.primary_category}`);
  if (tool.subcategory !== null) {
    text(tool.subcategory, "subcategory");
    const sub = subBySlug(tool.subcategory);
    if (
      !sub ||
      !(sub.parents ?? [sub.legacySlug]).includes(
        tool.primary_category as string,
      )
    )
      throw new Error("Subcategory must match its parent category");
  }
  for (const key of ["tagline", "description", "pricing_detail", "source"])
    if (tool[key] !== null && typeof tool[key] !== "string")
      throw new Error(`${key} must be text or null`);
  for (const key of ["logo_url", "screenshot_url"])
    if (tool[key] !== null) {
      const value = tool[key];
      if (
        typeof value === "string" &&
        /^\/(?!\/)[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp|svg|ico)$/.test(value) &&
        !value.split("/").includes("..")
      )
        continue;
      validateUrl(value);
    }
  if (
    !Array.isArray(tool.tags) ||
    !tool.tags.every((t) => typeof t === "string" && t.trim())
  )
    throw new Error("tags must be a text array");
  if (
    tool.dr !== null &&
    (typeof tool.dr !== "number" ||
      !Number.isFinite(tool.dr) ||
      tool.dr < 0 ||
      tool.dr > 100)
  )
    throw new Error("DR must be null or a number between 0 and 100");
  for (const key of ["is_featured", "is_verified"])
    if (typeof tool[key] !== "boolean")
      throw new Error(`${key} must be boolean`);
  if (tool.published_at !== null && !isPublicationDate(tool.published_at))
    throw new Error("Invalid publication date");
  if (tool.editorial !== undefined) validateEditorial(tool.editorial);
  return tool as unknown as ToolRecord;
}
export function validateCatalog(input: unknown[]): ToolRecord[] {
  const slugs = new Set<string>();
  const urls = new Set<string>();
  const tools = input.map((row) => {
    const tool = validateTool(row);
    if (slugs.has(tool.slug)) throw new Error(`Duplicate slug: ${tool.slug}`);
    const url = canonicalWebsite(tool.url);
    if (urls.has(url)) throw new Error(`Duplicate URL: ${tool.url}`);
    slugs.add(tool.slug);
    urls.add(url);
    return tool;
  });
  for (const tool of tools) {
    const seen = new Set<string>();
    for (const alternative of tool.editorial?.guide?.alternatives ?? []) {
      if (
        !slugs.has(alternative.slug) ||
        alternative.slug === tool.slug ||
        seen.has(alternative.slug)
      )
        throw new Error(
          `Invalid alternative for ${tool.slug}: ${alternative.slug}`,
        );
      seen.add(alternative.slug);
    }
  }
  return tools;
}
