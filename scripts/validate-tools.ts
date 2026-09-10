/**
 * Post-scrape HEAD validator.
 *
 * Re-checks every tool's official URL in data/tools.json with a HEAD
 * request and reports rows that have died since they were imported
 * (timeouts, 4xx/5xx, DNS failures). Optionally writes a pruned copy.
 *
 * Usage:
 *   pnpm tsx scripts/validate-tools.ts              # dry-run, print report
 *   pnpm tsx scripts/validate-tools.ts --write      # also write data/tools.json (only removes 100% dead rows)
 *   pnpm tsx scripts/validate-tools.ts --concurrency 16
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");
const TIMEOUT_MS = 6000;
const USER_AGENT = "Mozilla/5.0 (compatible; aiknows.tools-validator/1.0)";

type Tool = {
  slug: string;
  name: string;
  url?: string | null;
  [k: string]: unknown;
};

type Outcome = "ok" | "dead" | "timeout" | "dns" | "skip";

type Row = {
  slug: string;
  url: string;
  outcome: Outcome;
  status?: number;
  reason?: string;
};

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const concurrencyArg = [...args].find((a) => a.startsWith("--concurrency"));
const CONCURRENCY = concurrencyArg ? parseInt(concurrencyArg.split("=")[1] ?? concurrencyArg.slice(12), 10) || 16 : 16;

async function check(row: { slug: string; url: string }): Promise<Row> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(row.url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT, Accept: "*/*" },
    });
    clearTimeout(timer);
    // Some servers reject HEAD with 405 — fall back to a ranged GET.
    if (res.status === 405 || res.status === 501) {
      return await fallbackGet(row);
    }
    if (res.ok || (res.status >= 300 && res.status < 400)) {
      return { ...row, outcome: "ok", status: res.status };
    }
    return { ...row, outcome: "dead", status: res.status, reason: `HTTP ${res.status}` };
  } catch (err: unknown) {
    clearTimeout(timer);
    const e = err as { name?: string; cause?: { code?: string }; message?: string };
    if (e.name === "AbortError") {
      return { ...row, outcome: "timeout", reason: `${TIMEOUT_MS}ms` };
    }
    const code = e.cause?.code ?? "";
    if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
      return { ...row, outcome: "dns", reason: code };
    }
    return { ...row, outcome: "dead", reason: e.message ?? "fetch failed" };
  }
}

async function fallbackGet(row: { slug: string; url: string }): Promise<Row> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(row.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { Range: "bytes=0-0", "User-Agent": USER_AGENT, Accept: "*/*" },
    });
    clearTimeout(timer);
    if (res.ok || res.status === 206 || (res.status >= 300 && res.status < 400)) {
      return { ...row, outcome: "ok", status: res.status };
    }
    return { ...row, outcome: "dead", status: res.status, reason: `HTTP ${res.status}` };
  } catch (err: unknown) {
    clearTimeout(timer);
    const e = err as { name?: string; message?: string };
    if (e.name === "AbortError") return { ...row, outcome: "timeout", reason: `${TIMEOUT_MS}ms` };
    return { ...row, outcome: "dead", reason: e.message ?? "fetch failed" };
  }
}

async function main() {
  const raw = await readFile(TOOLS_PATH, "utf8");
  const tools = JSON.parse(raw) as Tool[];

  const targets = tools
    .filter((t) => t.url && /^https?:\/\//i.test(t.url))
    .map((t) => ({ slug: t.slug, url: t.url as string }));

  console.log(`Validating ${targets.length} URLs (concurrency=${CONCURRENCY}, timeout=${TIMEOUT_MS}ms)...`);
  const startedAt = Date.now();

  const results: Row[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < targets.length) {
      const idx = cursor++;
      results[idx] = await check(targets[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));

  const counts: Record<Outcome, number> = { ok: 0, dead: 0, timeout: 0, dns: 0, skip: 0 };
  for (const r of results) counts[r.outcome]++;

  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
  console.log(`\n── Results in ${elapsed}s ──`);
  for (const [k, v] of Object.entries(counts)) {
    console.log(`  ${k.padEnd(8)} ${v}`);
  }

  const bad = results.filter((r) => r.outcome !== "ok");
  if (bad.length) {
    console.log(`\n── ${bad.length} dead/timed-out rows ──`);
    for (const r of bad.slice(0, 50)) {
      console.log(`  ${r.slug.padEnd(38)} ${String(r.outcome).padEnd(8)} ${r.status ?? "-"}  ${r.reason ?? ""}  ${r.url}`);
    }
    if (bad.length > 50) console.log(`  … and ${bad.length - 50} more`);
  }

  const slugsToRemove = new Set(bad.map((r) => r.slug));
  if (shouldWrite && slugsToRemove.size) {
    const pruned = tools.filter((t) => !slugsToRemove.has(t.slug));
    await writeFile(TOOLS_PATH, JSON.stringify(pruned, null, 2) + "\n", "utf8");
    console.log(`\nWrote ${TOOLS_PATH} (${tools.length} → ${pruned.length} tools)`);
  } else if (slugsToRemove.size) {
    console.log(`\nRe-run with --write to remove ${slugsToRemove.size} dead rows from ${TOOLS_PATH}.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});