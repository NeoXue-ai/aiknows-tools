import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, renameSync } from "node:fs";
import { join } from "node:path";
import { readContent } from "./source";
import { toToolSummary, toSearchText } from "../../features/catalog/query";
const records = readContent();
const cards = records.map(toToolSummary);
const search = Object.fromEntries(
  records.map((t) => [t.slug, toSearchText(t)]),
);
// Hash generated payloads too: changing index projection must invalidate immutable caches.
const version = createHash("sha256")
  .update(JSON.stringify({ records, cards, search }))
  .digest("hex")
  .slice(0, 16);
const base = `/catalog/${version}`;
const output = join(process.cwd(), "public", base);
mkdirSync(output, { recursive: true });
mkdirSync(".catalog", { recursive: true });
writeFileSync(join(output, "cards.json"), JSON.stringify(cards));
writeFileSync(join(output, "search.json"), JSON.stringify(search));
// One atomic snapshot keeps content and browser index versions consistent in dev.
writeFileSync(
  ".catalog/catalog.tmp",
  JSON.stringify({ version, indexBase: base, tools: records }),
);
renameSync(".catalog/catalog.tmp", ".catalog/catalog.json");
writeFileSync(
  ".catalog/slugs.json",
  JSON.stringify(records.map((t) => t.slug)),
);
console.log(`Catalog: ${records.length} validated tools; index ${version}`);
