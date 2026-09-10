/**
 * Import findly.tools dataset into aiknows catalog.
 *
 * Maps findly categories → aiknows categories, generates slugs, deduplicates
 * against existing entries, and writes the merged result to data/tools.json.
 *
 * Usage:
 *   pnpm tsx scripts/import-findly.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const FINDLY_PATH = "/Users/lonnie/Desktop/findly_results/findly_tools.json";
const SCREENSHOTS_DIR = "/Users/lonnie/aiknows-tools/public/screenshots";

/* ── Findly → aiknows category mapping ── */

const CATEGORY_MAP: Record<string, string> = {
  // Title-case (as scraped)
  AI: "productivity",
  "AI Agents": "productivity",
  Analytics: "business-analytics",
  Automation: "productivity",
  Blogging: "writing-content",
  Boilerplates: "code-development",
  "Building Products": "productivity",
  Chatbots: "productivity",
  "Chrome Extensions": "productivity",
  Community: "productivity",
  "Content Creation": "writing-content",
  "Customer Support": "productivity",
  Design: "image-video",
  "Developer Apis": "code-development",
  "Developer Tools": "code-development",
  Directories: "research-data",
  Ecommerce: "ecommerce-sales",
  Education: "research-data",
  "Email Marketing": "seo-marketing",
  Fintech: "business-analytics",
  "Freelancer Tools": "productivity",
  Ios: "code-development",
  Marketing: "seo-marketing",
  Monitoring: "business-analytics",
  "No-Code": "code-development",
  Productivity: "productivity",
  "Productized Services": "productivity",
  "Remote Work": "productivity",
  SEO: "seo-marketing",
  Sales: "ecommerce-sales",
  "Social Media": "seo-marketing",
  Video: "image-video",
  "Website Builders": "code-development",
  Writing: "writing-content",
  // Kebab-case variants (also scraped)
  Ai: "productivity",
  "Ai Agents": "productivity",
  ai: "productivity",
  "ai-agents": "productivity",
  analytics: "business-analytics",
  automation: "productivity",
  blogging: "writing-content",
  boilerplates: "code-development",
  "building-products": "productivity",
  chatbots: "productivity",
  "chrome-extensions": "productivity",
  community: "productivity",
  "content-creation": "writing-content",
  "customer-support": "productivity",
  design: "image-video",
  "developer-apis": "code-development",
  "developer-tools": "code-development",
  directories: "research-data",
  ecommerce: "ecommerce-sales",
  education: "research-data",
  "email-marketing": "seo-marketing",
  fintech: "business-analytics",
  "freelancer-tools": "productivity",
  ios: "code-development",
  marketing: "seo-marketing",
  monitoring: "business-analytics",
  "No Code": "code-development",
  "no-code": "code-development",
  productivity: "productivity",
  "productized-services": "productivity",
  "remote-work": "productivity",
  Seo: "seo-marketing",
  seo: "seo-marketing",
  sales: "ecommerce-sales",
  "social-media": "seo-marketing",
  video: "image-video",
  "website-builders": "code-development",
  writing: "writing-content",
};

const DEFAULT_CATEGORY = "productivity";

/* ── Slug generation ── */

function toSlug(name: string): string {
  // Strip a trailing TLD when the raw name is a bare domain (e.g.
  // "aniv.ai" → "aniv", "100lead.com" → "100lead"). Otherwise we end up
  // with slugs like "aniv-ai" or "100leadcom" that external links + GSC
  // crawl as bare /<slug>, hitting a 404 before the proxy 301 catches
  // them. Detection runs BEFORE the normal slugifier, so a name like
  // "Web app 2.0" is left alone (whitespace rules it out).
  const trimmed = name.trim();
  const bareDomain = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(trimmed);
  const base = bareDomain ? trimmed.replace(/\.[a-z0-9-]+$/i, "") : trimmed;

  return base
    .toLowerCase()
    .replace(/[''']/g, "") // remove smart quotes
    .replace(/[^\w\s-]/g, "") // remove non-word chars except hyphens
    .replace(/[-\s]+/g, "-") // collapse whitespace & hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
}

/* ── Findly directory slug ── */

function findlySlug(directoryUrl: string): string | null {
  try {
    const u = new URL(directoryUrl);
    const path = u.pathname.replace(/^\/+|\/+$/g, "");
    return path || null;
  } catch {
    return null;
  }
}

/* ── Local screenshot lookup ── */

function localScreenshot(directoryUrl: string): string | null {
  const slug = findlySlug(directoryUrl);
  if (!slug) return null;
  const localPath = join(SCREENSHOTS_DIR, `${slug}.webp`);
  return existsSync(localPath) ? `/screenshots/${slug}.webp` : null;
}

/* ── Tagline extraction from description ── */

function extractTagline(desc: string | null, max = 150): string | null {
  if (!desc) return null;
  const trimmed = desc.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;

  // try first sentence
  const dot = trimmed.indexOf(". ");
  if (dot > 20 && dot < max) return trimmed.slice(0, dot);
  return trimmed.slice(0, max).replace(/\s\S*$/, "") + "…";
}

/* ── findly fingerprint cleanup ──
 * findly's source data carries its own generated boilerplate
 * ("Discover this {cat} tool on Findly.tools.") and referral tracking
 * params. Strip both so the catalog doesn't advertise its provenance. */

const FINDLY_BOILER_SUFFIX = /-?\s*Discover this [a-z0-9-]+ tool on Findly\.tools\.?$/i;

function cleanDescription(desc: string | null): string | null {
  if (!desc) return null;
  const stripped = desc.replace(FINDLY_BOILER_SUFFIX, "").trim();
  if (stripped === "" || /^No description available$/i.test(stripped)) return null;
  return stripped;
}

function stripFindlyParams(raw: string): string {
  const qIndex = raw.indexOf("?");
  if (qIndex === -1) return raw;
  const base = raw.slice(0, qIndex);
  const query = raw.slice(qIndex + 1);
  const kept = query.split("&").filter((pair) => {
    if (!pair) return false;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : safeDecode(pair.slice(eq + 1));
    return !/findly/i.test(key) && !/findly/i.test(value);
  });
  return kept.length ? `${base}?${kept.join("&")}` : base;
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

/* ── Types ── */

interface FindlyTool {
  name: string;
  description: string;
  official_url: string;
  directory_url: string;
  category: string[];
  tags: string[];
  pricing: string;
  logo_url: string;
  source_directory: string;
  scraped_at: string;
  screenshot_url: string;
  logo_path: string;
  screenshot_path: string;
}

interface AiknowsTool {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string;
  logo_url: string | null;
  screenshot_url: string | null;
  primary_category: string;
  tags: string[];
  pricing_detail: string | null;
  source: string | null;
}

/* ── Main ── */

async function main() {
  const findlyPath = FINDLY_PATH;
  const aiknowsPath = resolve(process.cwd(), "data/tools.json");
  const backupPath = aiknowsPath.replace(".json", ".bak.json");

  // 1. Load findly data
  const raw = await readFile(findlyPath, "utf8");
  const findly: FindlyTool[] = JSON.parse(raw);
  console.log(`[import] Loaded ${findly.length} tools from findly_tools.json`);

  // 2. Load existing aiknows data
  const existingRaw = await readFile(aiknowsPath, "utf8");
  const existingData = JSON.parse(existingRaw);
  const existing: AiknowsTool[] = Array.isArray(existingData) ? existingData : (existingData.tools ?? []);
  console.log(`[import] Existing catalog: ${existing.length} tools`);

  // 3. Build lookup maps for dedup
  const byUrl = new Map<string, AiknowsTool>();
  const bySlug = new Map<string, AiknowsTool>();
  for (const t of existing) {
    if (t.url) byUrl.set(t.url.replace(/\/$/, ""), t);
    bySlug.set(t.slug, t);
  }

  // 4. Transform findly tools
  const transformed: AiknowsTool[] = [];
  let skipped = 0;
  let mapped = 0;

  for (const ft of findly) {
    // generate slug
    let slug = toSlug(ft.name);
    if (!slug) { skipped++; continue; }

    // dedup by URL
    const normalizedUrl = ft.official_url.replace(/\/$/, "");
    if (byUrl.has(normalizedUrl)) { skipped++; continue; }

    // dedup by slug (if name-based slug matches existing)
    if (bySlug.has(slug)) {
      // append a suffix to avoid collision
      let i = 2;
      while (bySlug.has(`${slug}-${i}`)) i++;
      slug = `${slug}-${i}`;
    }

    // pick first valid findly category
    const findlyCat = ft.category?.find((c) => CATEGORY_MAP[c]) ?? "";
    const primaryCategory = CATEGORY_MAP[findlyCat] ?? DEFAULT_CATEGORY;

    const screenshotUrl = localScreenshot(ft.directory_url);
    const description = cleanDescription(ft.description);
    const url = stripFindlyParams(ft.official_url);

    transformed.push({
      slug,
      name: ft.name,
      tagline: extractTagline(description),
      description,
      url,
      logo_url: ft.logo_url || null,
      screenshot_url: screenshotUrl,
      primary_category: primaryCategory,
      tags: [],
      pricing_detail: null,
      source: null,
    });
    // Track the new slug/url so subsequent findly tools with the same name collide properly.
    bySlug.set(slug, { slug } as AiknowsTool);
    byUrl.set(normalizedUrl, { slug } as AiknowsTool);
    mapped++;
  }

  const withScreenshots = transformed.filter((t) => t.screenshot_url).length;
  console.log(`[import] Mapped: ${mapped}, skipped (dup): ${skipped}`);
  console.log(`[import] With local screenshots: ${withScreenshots} / ${transformed.length}`);

  // 5. Merge: existing first, then new
  const merged: AiknowsTool[] = [...existing, ...transformed];

  // 6. Write backup
  if (!existsSync(backupPath)) {
    await writeFile(backupPath, JSON.stringify(existingData, null, 2), "utf8");
    console.log(`[import] Backup written to ${backupPath}`);
  }

  // 7. Write merged
  const output: AiknowsTool[] = merged;
  await writeFile(aiknowsPath, JSON.stringify(output, null, 2), "utf8");
  console.log(`[import] Wrote ${output.length} tools to ${aiknowsPath}`);
  console.log(`[import] Done. Run \`pnpm seed\` to push to Supabase.`);
}

main().catch((err) => {
  console.error("[import] Failed:", err);
  process.exit(1);
});
