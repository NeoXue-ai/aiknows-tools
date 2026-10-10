/**
 * Regenerate data/slugs.ts from data/tools.json.
 *
 * proxy.ts imports SLUGS to decide whether a request path is a real tool
 * page or a genuine 404, so this file must be regenerated whenever the
 * catalog changes — otherwise restored/added tools stay unreachable.
 *
 * Usage: node scripts/build-slug-index.js
 */

const { readFileSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const OUT_PATH = resolve(process.cwd(), "data/slugs.ts");
const PER_LINE = 6;

const raw = JSON.parse(readFileSync(TOOLS_PATH, "utf-8"));
const tools = Array.isArray(raw) ? raw : (raw.tools ?? raw.data ?? []);
const slugs = [...new Set(tools.map((t) => t.slug).filter(Boolean))].sort();

const lines = [];
for (let i = 0; i < slugs.length; i += PER_LINE) {
  lines.push("  " + slugs.slice(i, i + PER_LINE).map((s) => JSON.stringify(s)).join(", ") + ",");
}

const out = `// Auto-generated from data/tools.json — do not edit by hand.
// Regenerate with: node scripts/build-slug-index.js
// Last generated: ${new Date().toISOString()}
export const SLUGS: ReadonlySet<string> = new Set([
${lines.join("\n")}
]);

export const SLUG_COUNT = ${slugs.length};
`;

writeFileSync(OUT_PATH, out, "utf-8");
console.log(`regenerated ${slugs.length} slugs`);
