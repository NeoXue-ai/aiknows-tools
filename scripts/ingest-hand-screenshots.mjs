/**
 * Ingest hand-captured screenshots from /Users/lonnie/Desktop/截图.
 *
 * Mapping: 1.png~117.png ↔ line numbers of /Users/lonnie/Desktop/网站名单.md,
 * which equals /tmp/screenshot_todo.tsv minus 4 removed entries
 * (phind, sora, algolia-recommend, bouncer). Order verified line-by-line.
 *
 * Steps per entry:
 *   1. cwebp -resize 1200 0 -q 80  → public/screenshots/<slug>.webp
 *   2. stamp tools.json entry with /screenshots/<slug>.webp
 *
 * Usage: node scripts/ingest-hand-screenshots.mjs [--write]
 *        (dry-run by default: reports sizes, no file writes)
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SHOTS_DIR = "/Users/lonnie/Desktop/截图";
const LIST_PATH = "/Users/lonnie/Desktop/网站名单.md";
const TSV_PATH = "/tmp/screenshot_todo.tsv";
const TOOLS_PATH = path.resolve("data/tools.json");
const OUT_DIR = path.resolve("public/screenshots");
const SHOULD_WRITE = process.argv.includes("--write");

function readList() {
  const md = fs
    .readFileSync(LIST_PATH, "utf8")
    .trim()
    .split("\n")
    .map((l) => l.trim().split(/\s+/).map((x) => x.trim()));
  const tsv = fs
    .readFileSync(TSV_PATH, "utf8")
    .trim()
    .split("\n")
    .map((l) => l.split("\t").map((x) => x.trim()));
  const removed = new Set(["phind", "sora", "algolia-recommend", "bouncer"]);
  const expected = tsv.filter((o) => !removed.has(o[0]));
  if (expected.length !== md.length) {
    throw new Error(`list length mismatch: md=${md.length} expected=${expected.length}`);
  }
  for (let i = 0; i < expected.length; i++) {
    if (md[i][0] !== expected[i][0] || md[i][1] !== expected[i][2]) {
      throw new Error(`order mismatch at line ${i + 1}`);
    }
  }
  console.log(`[ingest] mapping verified: ${md.length} entries, order OK`);
  return md.map((p) => ({ slug: p[0], url: p[1] }));
}

function main() {
  const list = readList();
  const tools = JSON.parse(fs.readFileSync(TOOLS_PATH, "utf8"));
  const bySlug = new Map(tools.map((t) => [t.slug, t]));

  let converted = 0;
  let stamped = 0;
  const missingSlug = [];
  const errors = [];

  for (let i = 0; i < list.length; i++) {
    const { slug } = list[i];
    const n = i + 1;
    const src = path.join(SHOTS_DIR, `${n}.png`);
    const t = bySlug.get(slug);
    if (!t) {
      missingSlug.push(slug);
      continue;
    }
    const out = path.join(OUT_DIR, `${slug}.webp`);
    if (!SHOULD_WRITE) {
      const size = fs.existsSync(out)
        ? `${fs.statSync(out).size}b(existing)`
        : "new";
      console.log(`  ${String(n).padStart(3)} ${slug.padEnd(22)} ${size}`);
      continue;
    }
    if (!fs.existsSync(src)) {
      errors.push(`missing src ${src}`);
      continue;
    }
    try {
      execFileSync(
        "cwebp",
        ["-resize", "1200", "0", "-q", "80", src, "-o", out],
        { stdio: "ignore" },
      );
      converted++;
    } catch (e) {
      errors.push(`cwebp failed for ${slug}: ${e.message}`);
      continue;
    }
    if (t.screenshot_url !== `/screenshots/${slug}.webp`) stamped++;
    t.screenshot_url = `/screenshots/${slug}.webp`;
  }

  console.log(`[ingest] converted: ${converted}`);
  console.log(`[ingest] stamped in tools.json: ${stamped}`);
  if (missingSlug.length) console.log(`[ingest] WARN unknown slugs: ${missingSlug.join(", ")}`);
  if (errors.length) {
    console.log(`[ingest] ERRORS (${errors.length}):`);
    for (const e of errors) console.log("  " + e);
  }

  if (!SHOULD_WRITE) {
    console.log(`[ingest] DRY-RUN — rerun with --write to convert & stamp.`);
    return;
  }
  fs.writeFileSync(TOOLS_PATH, JSON.stringify(tools, null, 2), "utf8");
  console.log(`[ingest] wrote ${tools.length} tools`);
}

main();
