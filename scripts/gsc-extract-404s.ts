/**
 * Extract URLs from a GSC Coverage Drilldown xlsx export.
 * Outputs one URL per line on stdout — pipe into `gsc bulk-inspect`
 * to verify post-deploy that Google now sees the redirected targets.
 *
 * Usage:
 *   pnpm tsx scripts/gsc-extract-404s.ts <coverage.xlsx> > urls.txt
 *   node scripts/gsc.mjs bulk-inspect https://aiknows.tools/ urls.txt
 *
 * The whole of sheet2 (表格) is the per-URL table — column A holds the URL,
 * column B the last crawl date. The xlsx carries no per-row "Reason" column;
 * the only signal that this is the 404 drilldown is the footer text
 * "未找到 (404)" / "Not found (404)" in sharedStrings — but since GSC only
 * exports this view filtered to one category at a time, treating the whole
 * sheet as 404 URLs is correct.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const xlsxPath = process.argv[2];
if (!xlsxPath) {
  console.error("Usage: tsx scripts/gsc-extract-404s.ts <coverage.xlsx>");
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "gsc-404-"));
const unzip = spawnSync("unzip", ["-o", xlsxPath, "-d", tmp], { stdio: ["ignore", "ignore", "pipe"] });
if (unzip.status !== 0) {
  console.error("unzip failed:", unzip.stderr?.toString() ?? "");
  process.exit(1);
}

try {
  const decode = (s: string) =>
    s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

  const sharedStrings = (() => {
    try {
      const xml = readFileSync(join(tmp, "xl/sharedStrings.xml"), "utf8");
      const out: string[] = [];
      const re = /<si[^>]*>([\s\S]*?)<\/si>/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(xml))) {
        const parts: string[] = [];
        const tr = /<t[^>]*>([\s\S]*?)<\/t>/g;
        let tm: RegExpExecArray | null;
        while ((tm = tr.exec(m[1]))) parts.push(decode(tm[1]));
        out.push(parts.join(""));
      }
      return out;
    } catch {
      return [] as string[];
    }
  })();

  function readCell(cellXml: string): string {
    const t = cellXml.match(/\bt="([^"]+)"/)?.[1];
    if (t === "s") {
      const v = cellXml.match(/<v>([\s\S]*?)<\/v>/);
      const idx = v ? Number(v[1]) : NaN;
      return Number.isFinite(idx) ? sharedStrings[idx] ?? "" : "";
    }
    if (t === "str" || t === "inlineStr") {
      const m = cellXml.match(/<t[^>]*>([\s\S]*?)<\/t>/);
      return m ? decode(m[1]) : "";
    }
    const m = cellXml.match(/<v>([\s\S]*?)<\/v>/);
    return m ? decode(m[1]) : "";
  }

  const sheetXml = readFileSync(join(tmp, "xl/worksheets/sheet2.xml"), "utf8");
  const rowRe = /<row[^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  const cellRe = /<c\s+r="([A-Z]+\d+)"([^>]*)>([\s\S]*?)<\/c>/g;

  const urls: string[] = [];
  let rowMatch: RegExpExecArray | null;
  while ((rowMatch = rowRe.exec(sheetXml))) {
    const r = Number(rowMatch[1]);
    if (r === 1) continue; // header (网址 / 上次抓取日期)
    cellRe.lastIndex = 0;
    const cellMap: Record<string, string> = {};
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rowMatch[2]))) {
      const col = cm[1].replace(/\d+$/, "");
      cellMap[col] = readCell(`<c${cm[2]}>${cm[3]}</c>`);
    }
    const url = cellMap["A"]?.trim();
    if (url && url !== "网址") urls.push(url);
  }

  if (!urls.length) {
    console.error("No URLs found in sheet2 column A. Is this a Coverage Drilldown export?");
    process.exit(1);
  }

  for (const u of urls) process.stdout.write(u + "\n");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}