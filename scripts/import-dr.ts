/**
 * Import Domain Rating (DR) values into the aiknows catalog.
 *
 * Reads a domain-keyed DR file ({ "example.com": 42.0 }) and stamps each
 * tool in data/tools.json with the DR of its URL's hostname. Tools without
 * a match get dr: null so the UI renders "not recorded" rather than a badge.
 *
 * Usage:
 *   pnpm tsx scripts/import-dr.ts [path-to-dr-json]
 */

import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_DR_PATH = "/Users/lonnie/Desktop/findly_results/dr_ratings.json";
const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function main() {
  const drPath = process.argv[2] ?? DEFAULT_DR_PATH;

  const drRaw = await readFile(drPath, "utf8");
  const dr: Record<string, number> = JSON.parse(drRaw);

  const toolsRaw = await readFile(TOOLS_PATH, "utf8");
  const tools = JSON.parse(toolsRaw) as Record<string, unknown>[];

  let matched = 0;
  for (const tool of tools) {
    const host = tool.url ? hostname(String(tool.url)) : null;
    const value = host ? dr[host] : undefined;
    if (typeof value === "number") {
      tool.dr = value;
      matched++;
    } else {
      tool.dr = null;
    }
  }

  const backupPath = TOOLS_PATH.replace(/\.json$/, ".dr.bak.json");
  if (!existsSync(backupPath)) {
    await writeFile(backupPath, toolsRaw, "utf8");
    console.log(`[import-dr] Backup written to ${backupPath}`);
  }

  await writeFile(TOOLS_PATH, JSON.stringify(tools, null, 2), "utf8");
  console.log(`[import-dr] DR file: ${Object.keys(dr).length} domains`);
  console.log(`[import-dr] Matched: ${matched} / ${tools.length} tools`);
  console.log(`[import-dr] Wrote ${tools.length} tools to ${TOOLS_PATH}`);
}

main().catch((err) => {
  console.error("[import-dr] Failed:", err);
  process.exit(1);
});
