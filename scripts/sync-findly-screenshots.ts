/**
 * Backfill local screenshots for catalog entries that have none.
 *
 * For every tool in data/tools.json with screenshot_url == null, matches it
 * back to the findly harvest (by URL then name), finds the harvested
 * screenshot inside ~/Desktop/findly-crawl/images/<findly-slug>/, converts
 * it to webp (cwebp), writes public/screenshots/<findly-slug>.webp, and
 * stamps the entry with /screenshots/<findly-slug>.webp.
 *
 * Idempotent: skips entries that already have a screenshot_url.
 *
 * Usage:
 *   pnpm tsx scripts/sync-findly-screenshots.ts
 */

import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { execFileSync } from "node:child_process";

const FINDLY_PATH = "/Users/lonnie/Desktop/findly-crawl/findly_tools.json";
const FINDLLY_IMAGES = "/Users/lonnie/Desktop/findly-crawl/images";
const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const SCREENSHOTS_DIR = resolve(process.cwd(), "public/screenshots");

function findlySlug(directoryUrl: string): string | null {
  try {
    const path = new URL(directoryUrl).pathname.replace(/^\/+|\/+$/g, "");
    return path || null;
  } catch {
    return null;
  }
}

const SHOT_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

async function findShotImage(slug: string): Promise<string | null> {
  const dir = join(FINDLLY_IMAGES, slug);
  let files: string[];
  try {
    files = await readdir(dir);
  } catch {
    return null;
  }
  const shot = files.find((f) => f.toLowerCase().startsWith("screenshot"));
  if (!shot) return null;
  const full = join(dir, shot);
  return existsSync(full) ? full : null;
}

async function main() {
  const findly = JSON.parse(await readFile(FINDLY_PATH, "utf8")) as any[];
  const tools = JSON.parse(await readFile(TOOLS_PATH, "utf8")) as any[];

  const byUrl = new Map<string, string>();
  const byName = new Map<string, string>();
  for (const ft of findly) {
    const slug = findlySlug(ft.directory_url);
    if (!slug) continue;
    byUrl.set(String(ft.official_url ?? "").replace(/\/$/, ""), slug);
    byName.set(String(ft.name ?? "").toLowerCase(), slug);
  }

  let converted = 0;
  let already = 0;
  let skippedNoSrc = 0;
  const updated: string[] = [];

  for (const t of tools) {
    if (t.screenshot_url) {
      already++;
      continue;
    }
    const u = String(t.url ?? "").replace(/\/$/, "");
    const slug = byUrl.get(u) ?? byName.get(String(t.name ?? "").toLowerCase());
    if (!slug) {
      skippedNoSrc++;
      continue;
    }
    const src = await findShotImage(slug);
    if (!src) {
      skippedNoSrc++;
      continue;
    }
    const out = join(SCREENSHOTS_DIR, `${slug}.webp`);
    if (!existsSync(out)) {
      execFileSync("cwebp", ["-q", "80", src, "-o", out], { stdio: "ignore" });
    }
    t.screenshot_url = `/screenshots/${slug}.webp`;
    updated.push(t.slug);
    converted++;
  }

  await writeFile(TOOLS_PATH, JSON.stringify(tools, null, 2), "utf8");
  console.log(`[shots] entries already with screenshot: ${already}`);
  console.log(`[shots] filled: ${converted} (updated ${updated.length} entries)`);
  console.log(`[shots] no findly/disk source: ${skippedNoSrc}`);
  console.log(`[shots] Wrote ${tools.length} tools to ${TOOLS_PATH}`);
  if (converted > 0) {
    console.log(`[shots] sample: ${updated.slice(0, 5).join(" | ")}`);
  }
}

main().catch((err) => {
  console.error("[shots] Failed:", err);
  process.exit(1);
});