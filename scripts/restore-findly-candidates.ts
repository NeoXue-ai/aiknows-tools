/**
 * Restore AI-tool candidates from the latest findly.tools harvest.
 *
 * The committed catalog (data/tools.json) lost ~1600 findly entries that were
 * never imported (and ~200 that were added then accidentally reset). This
 * script finds every findly tool that is NOT already in the catalog, applies
 * a non-AI exclude filter (gambling / lottery / adult), and produces entries
 * matching the current data model (logo_url via Google favicon, dr from the
 * dr_ratings domain map, screenshot_url → local webp when present).
 *
 * `sub` and precise `primary_category` are left for scripts/reclassify-categories.ts:
 *   pnpm tsx scripts/reclassify-categories.ts --write
 *
 * Usage:
 *   pnpm tsx scripts/restore-findly-candidates.ts          # dry-run: stats + report
 *   pnpm tsx scripts/restore-findly-candidates.ts --write  # merge into tools.json
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";

const FINDLY_PATH = "/Users/lonnie/Desktop/findly-crawl/findly_tools.json";
const DEFAULT_DR_PATH = "/Users/lonnie/Desktop/AIknows.tools/findly_results/dr_ratings.json";
const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const SCREENSHOTS_DIR = resolve(process.cwd(), "public/screenshots");

const SHOULD_WRITE = process.argv.includes("--write");

/* ── findly → aiknows category mapping (only a coarse fallback seed) ── */

const CATEGORY_MAP: Record<string, string> = {
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
};

const DEFAULT_CATEGORY = "productivity";

/* ── Non-AI exclude filter (gambling / lottery / adult / warez) ── */

const NON_AI = /satta\s*matka|matka|kalyan\s*143|lottery|kerala\s*lotter|cricket\s*betting|betting\s*tips|real\s*money|cash\s*prize|jackpot|roulette|casino\s*|gambl|onlyfans|only-fans|fansly|porn|xxx|nsfw|nude|sex\s*chat|adult\s*chat|hookup|hentai/i;

/* Clearly not AI tools (games, toys, trivial sites, generators of nothing). */
const CLEAR_NON_AI =
  /\b(2048|wordle|sudoku|crossword|solitaire|jigsaw|hangman|quiz|puzzle|brain\s*teaser|interstellar\s*comet|comet\s*tracking|horoscope|meme\s*game|personality\s*test|name\s*challenge|day\s*of\s*year|sitemap\s*tool|daily\s*quote|random\s*(facts|number|color|name))\b|\bplay\s+(2048|games)|wallpaper\s*(app|maker)|\bextension\s+for\s+browsers?\b(?!.*\bai\b)/i;

/* Findly lists plenty of non-AI SaaS/sites; only import ones with an AI signal. */
const AI_SIGNAL =
  /(^|[^a-z])ai([^a-z]|$)|artificial intelligence|large language model|\bgpt\b|\bllm\b|\bllms\b|\bchatbot\b|\bcopilot\b|machine learning|neural network|deep learning|diffusion\b|text-?to-\w+|ai-?powered|ai-?generated|generative ai|speech-?to-?text|speech-?to-?speech|transcri\w*|summari\w*|ai (agent|assistant|writer|image|video|voice|code|art|music|copy|seo|marketing|sales|detector|humanizer|generator|chat)|(image|video|voice|music|text|code|content|logo|avatar|headshot|photo|podcast|presentation) (generator|maker|creator)|ai for\b|with ai\b|using ai\b|powered by ai\b|language model|virtual assistant/i;

function classifySignal(ft: any): "AI" | "UNCLEAR" | "EXCLUDED" {
  const text = `${ft.name ?? ""} ${ft.description ?? ""} ${(ft.tags ?? []).join(" ")}`;
  if (NON_AI.test(text) || CLEAR_NON_AI.test(text)) return "EXCLUDED";
  return AI_SIGNAL.test(text) ? "AI" : "UNCLEAR";
}

/* ── Slug generation ── */

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[''']/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ── findly directory slug (used for screenshot filenames + image dirs) ── */

function findlySlug(directoryUrl: string): string | null {
  try {
    const path = new URL(directoryUrl).pathname.replace(/^\/+|\/+$/g, "");
    return path || null;
  } catch {
    return null;
  }
}

/* ── Tagline / description cleanup (mirrors import-findly.ts) ── */

const FINDLY_BOILER_SUFFIX = /-?\s*Discover this [a-z0-9-]+ tool on Findly\.tools\.?$/i;

function cleanDescription(desc: string | null): string | null {
  if (!desc) return null;
  const stripped = desc.replace(FINDLY_BOILER_SUFFIX, "").trim();
  if (stripped === "" || /^No description available$/i.test(stripped)) return null;
  return stripped;
}

function extractTagline(desc: string | null, max = 150): string | null {
  if (!desc) return null;
  const trimmed = desc.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  const dot = trimmed.indexOf(". ");
  if (dot > 20 && dot < max) return trimmed.slice(0, dot);
  return trimmed.slice(0, max).replace(/\s\S*$/, "") + "…";
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

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/* ── Main ── */

async function main() {
  const findly = JSON.parse(await readFile(FINDLY_PATH, "utf8")) as any[];
  const tools = JSON.parse(await readFile(TOOLS_PATH, "utf8")) as any[];

  let dr: Record<string, number> = {};
  const drPath = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : DEFAULT_DR_PATH;
  try {
    dr = JSON.parse(await readFile(drPath, "utf8"));
  } catch {
    console.log(`[restore] WARN: DR file not loaded (${drPath}); dr will be null`);
  }

  // existing catalog lookup
  const byUrl = new Map<string, any>();
  const byNameSlug = new Map<string, any>();
  for (const t of tools) {
    if (t.url) byUrl.set(String(t.url).replace(/\/$/, ""), t);
    if (t.slug) byNameSlug.set(String(t.slug), t);
  }

  const aiCandidates: any[] = [];
  const unclear: any[] = [];
  const excluded: any[] = [];
  const seen = new Set<string>();

  for (const ft of findly) {
    const url = String(ft.official_url ?? "").replace(/\/$/, "");
    const slug = toSlug(ft.name ?? "");
    if (!slug || byUrl.has(url) || byNameSlug.has(slug)) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);

    const kind = classifySignal(ft);
    if (kind === "EXCLUDED") {
      excluded.push(ft);
      continue;
    }

    const fSlug = findlySlug(ft.directory_url);
    const localShot =
      fSlug && existsSync(join(SCREENSHOTS_DIR, `${fSlug}.webp`)) ? `/screenshots/${fSlug}.webp` : null;

    const host = hostname(url);
    const drValue = host && typeof dr[host] === "number" ? dr[host] : null;

    const findlyCat = (ft.category ?? []).find((c: string) => CATEGORY_MAP[c]) ?? "";
    const primaryCategory = CATEGORY_MAP[findlyCat] ?? DEFAULT_CATEGORY;
    const description = cleanDescription(ft.description ?? null);
    const cleanUrl = stripFindlyParams(ft.official_url ?? "");

    const record = {
      slug,
      name: ft.name ?? "",
      tagline: extractTagline(description),
      description,
      url: cleanUrl,
      logo_url: host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null,
      screenshot_url: localShot,
      primary_category: primaryCategory,
      tags: [],
      pricing_detail: null,
      source: null,
      dr: drValue,
      sub: null,
    };
    (kind === "AI" ? aiCandidates : unclear).push(record);
  }

  const addedTotal = aiCandidates.length + unclear.length;
  console.log(`[restore] findly total: ${findly.length}`);
  console.log(`[restore] already in catalog: ${findly.length - addedTotal - excluded.length}`);
  console.log(`[restore] EXCLUDED (non-AI): ${excluded.length}`);
  if (excluded.length) {
    console.log(`  excluded: ${excluded.map((e) => e.name).join(" | ")}`);
  }
  console.log(`[restore] AI candidates: ${aiCandidates.length}`);
  console.log(`[restore] UNCLEAR (no AI signal): ${unclear.length}`);

  const agg = (list: any[]) => {
    const m = new Map<string, number>();
    for (const c of list) m.set(c.primary_category, (m.get(c.primary_category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  console.log(`\n[restore] AI candidates by primary_category:`);
  for (const [cat, n] of agg(aiCandidates)) console.log(`  ${String(n).padStart(4)}  ${cat}`);
  if (unclear.length) {
    console.log(`\n[restore] UNCLEAR by primary_category:`);
    for (const [cat, n] of agg(unclear)) console.log(`  ${String(n).padStart(4)}  ${cat}`);
  }

  const withShot = aiCandidates.filter((c) => c.screenshot_url).length;
  const withDr = aiCandidates.filter((c) => typeof c.dr === "number").length;
  console.log(`\n[restore] AI with local screenshot: ${withShot}`);
  console.log(`[restore] AI with DR match: ${withDr}`);

  const aiReportPath = "/tmp/restore-ai-candidates.json";
  const unclearReportPath = "/tmp/restore-unclear.json";
  await writeFile(aiReportPath, JSON.stringify(aiCandidates, null, 2), "utf8");
  await writeFile(unclearReportPath, JSON.stringify(unclear, null, 2), "utf8");
  console.log(`[restore] AI list → ${aiReportPath}`);
  console.log(`[restore] UNCLEAR list → ${unclearReportPath}`);

  if (!SHOULD_WRITE) {
    console.log(`\nDRY-RUN — no changes to data/tools.json.`);
    console.log(`AI sample (first 10):`);
    for (const c of aiCandidates.slice(0, 10)) {
      console.log(`  • ${c.slug}  [${c.primary_category}]  ${c.description?.slice(0, 80) ?? ""}`);
    }
    if (unclear.length) {
      console.log(`\nUNCLEAR sample (first 10):`);
      for (const c of unclear.slice(0, 10)) {
        console.log(`  • ${c.slug}  [${c.primary_category}]  ${c.description?.slice(0, 80) ?? ""}`);
      }
    }
    console.log(`\nTo merge AI candidates only, run: pnpm tsx scripts/restore-findly-candidates.ts --write`);
    return;
  }

  const backupPath = TOOLS_PATH.replace(/\.json$/, ".restore.bak.json");
  if (!existsSync(backupPath)) {
    await writeFile(backupPath, JSON.stringify(tools, null, 2), "utf8");
    console.log(`[restore] Backup written: ${backupPath}`);
  }

  const merged = [...tools, ...aiCandidates];
  await writeFile(TOOLS_PATH, JSON.stringify(merged, null, 2), "utf8");
  console.log(`[restore] Wrote ${merged.length} tools to ${TOOLS_PATH} (AI candidates only; ${unclear.length} UNCLEAR left in ${unclearReportPath})`);
  console.log(`[restore] Next: pnpm tsx scripts/reclassify-categories.ts --write`);
}

main().catch((err) => {
  console.error("[restore] Failed:", err);
  process.exit(1);
});