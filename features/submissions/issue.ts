import type { ToolRecord } from "../catalog/types";
import { validateCatalog } from "../catalog/validation";
export function toolFromIssue(
  body: string,
  existing: ToolRecord[],
): ToolRecord {
  if (body.length > 20000) throw new Error("Submission is too long");
  const fields = new Map<string, string>();
  const pattern = /^### ([^\n]+)\n+([\s\S]*?)(?=^### |$(?![\s\S]))/gm;
  for (const match of body.matchAll(pattern)) {
    const name = match[1].trim();
    if (fields.has(name)) throw new Error(`Duplicate issue field: ${name}`);
    fields.set(name, match[2].trim());
  }
  function get(name: string) {
    const value = fields.get(name) ?? "";
    return value === "_No response_" ? "" : value;
  }
  const tool: ToolRecord = {
    slug: get("Slug"),
    name: get("Tool name"),
    url: get("Website"),
    tagline: get("Short description") || null,
    description: get("Full description") || null,
    primary_category: get("Primary category"),
    subcategory: get("Subcategory") || null,
    tags: get("Tags")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    logo_url: null,
    screenshot_url: null,
    pricing_detail: null,
    source: get("Website"),
    dr: null,
    is_featured: false,
    is_verified: false,
    published_at: null,
  };
  if (
    !tool.tagline ||
    tool.tagline.length > 240 ||
    !tool.description ||
    tool.description.length > 10000 ||
    tool.name.length > 120 ||
    tool.slug.length > 100 ||
    tool.tags.length > 20
  )
    throw new Error(
      "Please provide a name, short description (240 characters max), and full description (10000 characters max)",
    );
  validateCatalog([...existing, tool]);
  return tool;
}
