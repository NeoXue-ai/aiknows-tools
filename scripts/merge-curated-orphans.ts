/**
 * Merge the 120 official curated tools back into the catalog.
 *
 * These rows live only in the remote Supabase 'tools' table (all created
 * 2026-06-14 — the project's first seed) and were never re-imported after
 * the catalog was rebuilt around the findly harvest. They are real products
 * (ChatGPT, Claude, Zapier, …), not seed junk.
 *
 * Modeled to match the current catalog data model:
 *   - pricing_detail / source → null (catalog is uniformly null on both)
 *   - dr → looked up in dr_ratings.json by host
 *   - logo_url → Google favicon (same convention as restore-findly-candidates.ts)
 *   - screenshot_url / sub → null (sub is filled by reclassify-categories.ts)
 *   - primary_category → remote legacy value, also normalized by reclassify
 *
 * Entries whose name already exists in the catalog are skipped (avoid dupes —
 * e.g. catalog already has krea-2 while the orphan list has 'Krea').
 *
 * Usage:
 *   pnpm tsx scripts/merge-curated-orphans.ts            # dry-run + report
 *   pnpm tsx scripts/merge-curated-orphans.ts --write    # append to tools.json
 *   # then: pnpm tsx scripts/reclassify-categories.ts --write
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const ORPHANS_PATH = "/tmp/orphans_full.json";
const DR_PATH = "/Users/lonnie/Desktop/AIknows.tools/findly_results/dr_ratings.json";
const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");

const SHOULD_WRITE = process.argv.includes("--write");

function hostname(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function main() {
  const orphans = JSON.parse(await readFile(ORPHANS_PATH, "utf8")).rows as any[];
  const tools = JSON.parse(await readFile(TOOLS_PATH, "utf8")) as any[];
  let dr: Record<string, number> = {};
  try {
    dr = JSON.parse(await readFile(DR_PATH, "utf8"));
  } catch {
    console.log("[merge] WARN: dr_ratings.json not loaded; dr will be null");
  }

  const existingNames = new Set(tools.map((t) => String(t.name ?? "").toLowerCase()));
  const existingSlugs = new Set(tools.map((t) => t.slug));

  const candidates: any[] = [];
  const skippedByName: string[] = [];
  const skippedNotApproved: string[] = [];

  for (const o of orphans) {
    if (o.status !== "approved") {
      skippedNotApproved.push(o.slug);
      continue;
    }
    const low = String(o.name ?? "").toLowerCase();
    if (existingNames.has(low) || existingSlugs.has(o.slug)) {
      skippedByName.push(o.slug);
      continue;
    }
    const host = hostname(o.url);
    const drValue = host && typeof dr[host] === "number" ? dr[host] : null;
    candidates.push({
      slug: o.slug,
      name: o.name ?? "",
      tagline: o.tagline ?? null,
      description: o.description ?? null,
      url: o.url ?? "",
      logo_url: host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : null,
      screenshot_url: null,
      primary_category: o.primary_category ?? "productivity",
      tags: Array.isArray(o.tags) ? o.tags : [],
      pricing_detail: null,
      source: null,
      dr: drValue,
      sub: null,
    });
  }

  console.log(`[merge] orphans loaded: ${orphans.length}`);
  console.log(`[merge] to add: ${candidates.length}`);
  console.log(`[merge] skipped (name/slug already in catalog): ${skippedByName.length}`);
  if (skippedByName.length) console.log(`  ${skippedByName.join(" | ")}`);
  console.log(`[merge] skipped (not approved): ${skippedNotApproved.length}`);

  const withDr = candidates.filter((c) => typeof c.dr === "number").length;
  const withDesc = candidates.filter((c) => c.description).length;
  console.log(`[merge] with dr: ${withDr} / with description: ${withDesc}`);

  if (!SHOULD_WRITE) {
    console.log(`\n[merge] DRY-RUN — no changes.`);
    console.log(`sample (first 12):`);
    for (const c of candidates.slice(0, 12)) {
      console.log(`  • ${c.slug}  [${c.primary_category}]  dr=${c.dr ?? "-"}  ${c.tagline ?? ""}`);
    }
    console.log(`\nTo append, run: pnpm tsx scripts/merge-curated-orphans.ts --write`);
    return;
  }

  const merged = [...tools, ...candidates];
  await writeFile(TOOLS_PATH, JSON.stringify(merged, null, 2), "utf8");
  console.log(`\n[merge] Wrote ${merged.length} tools to ${TOOLS_PATH} (+${candidates.length})`);
  console.log(`[merge] Next: pnpm tsx scripts/reclassify-categories.ts --write`);
}

main().catch((err) => {
  console.error("[merge] Failed:", err);
  process.exit(1);
});