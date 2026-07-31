/**
 * Remove findly.tools fingerprints from data/tools.json.
 *
 * Scope is deliberately minimal and byte-preserving:
 *  - Strips findly's generated " - Discover this {cat} tool on Findly.tools."
 *    suffix from taglines/descriptions (nulls pure placeholders / "No description
 *    available").
 *  - Removes query params whose KEY or VALUE contains "findly" from the url field
 *    and from inline markdown links in content. Everything else is preserved
 *    byte-for-byte (no URL re-serialization).
 *
 * Usage: pnpm tsx scripts/strip-findly.ts
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const boilerSuffix = /-?\s*Discover this [a-z0-9-]+ tool on Findly\.tools\.?$/i;

function stripFindlyParams(raw: string): string {
  const qIndex = raw.indexOf("?");
  if (qIndex === -1) return raw;
  const base = raw.slice(0, qIndex);
  const query = raw.slice(qIndex + 1);
  const kept = query.split("&").filter((pair) => {
    if (!pair) return false;
    const eq = pair.indexOf("=");
    const key = eq === -1 ? pair : pair.slice(0, eq);
    const value = eq === -1 ? "" : decodeURIComponentSafe(pair.slice(eq + 1));
    return !/findly/i.test(key) && !/findly/i.test(value);
  });
  return kept.length ? `${base}?${kept.join("&")}` : base;
}

function decodeURIComponentSafe(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
}

function stripContent(text: string): string {
  return text.replace(/\]\((https?:\/\/[^)\s]+)\)/g, (_m, url: string) => `](${stripFindlyParams(url)})`);
}

async function main() {
  const path = resolve(process.cwd(), "data/tools.json");
  const tools = JSON.parse(await readFile(path, "utf8")) as Record<string, any>[];

  let tagBoiler = 0, descBoiler = 0, urlParam = 0, contentParam = 0;

  for (const t of tools) {
    for (const field of ["tagline", "description"] as const) {
      if (typeof t[field] !== "string") continue;
      let v = t[field] as string;
      const stripped = v.replace(boilerSuffix, "").trim();
      if (stripped !== v.trim()) {
        v = stripped;
        field === "tagline" ? tagBoiler++ : descBoiler++;
      }
      if (v === "" || /^No description available$/i.test(v)) {
        t[field] = null;
      } else {
        t[field] = stripContent(v);
        if (t[field] !== v) contentParam++;
      }
    }

    if (typeof t.url === "string") {
      const u = stripFindlyParams(t.url);
      if (u !== t.url) {
        t.url = u;
        urlParam++;
      }
    }
  }

  await writeFile(path, JSON.stringify(tools, null, 2), "utf8");
  console.log("tagline boilerplate:", tagBoiler);
  console.log("description boilerplate:", descBoiler);
  console.log("url findly params removed:", urlParam);
  console.log("content inline-link findly params removed:", contentParam);

  const tag = tools.filter((t) => t.tagline && /findly/i.test(String(t.tagline))).length;
  const desc = tools.filter((t) => t.description && /findly/i.test(String(t.description))).length;
  const url = tools.filter((t) => t.url && /findly/i.test(String(t.url))).length;
  const src = tools.filter((t) => t.source && /findly/i.test(String(t.source))).length;
  console.log("remaining -> tagline:", tag, "description:", desc, "url:", url, "source:", src);
}

main();
