/**
 * Investigate suspicious traffic captured in `request_logs` (see
 * supabase/migrations/20260824000001_request_logs.sql). Output is a plain
 * text table to stdout — no writes.
 *
 * Subcommands:
 *   bots            list rows flagged is_suspicious=true
 *   top-ips         aggregate hits by IP (default 50)
 *   top-asn         aggregate hits by as_org (run scripts/enrich-ips.ts first)
 *   path-summary    all visitors to a single path
 *
 * Common flags:
 *   --since=<n><h|d|w|m>   lookback window (e.g. 7d, 12h, 30m). Default 7d.
 *   --limit=<n>            row/aggregate cap. Default 50.
 *   --path=<path>          path filter (path-summary only)
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/query-bot-traffic.ts bots --since 7d
 *   pnpm tsx --env-file=.env.local scripts/query-bot-traffic.ts top-ips --since 7d --limit 100
 *   pnpm tsx --env-file=.env.local scripts/query-bot-traffic.ts top-asn --since 7d
 *   pnpm tsx --env-file=.env.local scripts/query-bot-traffic.ts path-summary --path /tools/rcmp-eligibility-checker
 */

import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_LOOKBACK = "7d";
const DEFAULT_LIMIT = 50;
const HARD_CAP = 50_000; // safety net for the in-JS aggregator

type Row = {
  ts: string;
  ip: string;
  ua: string | null;
  path: string;
  referer: string | null;
  country: string | null;
  method: string | null;
  is_suspicious: boolean;
  suspicion_reason: string | null;
  asn: string | null;
  as_org: string | null;
};

// The supabase-js query builder chain returns several different builder
// types (PostgrestQueryBuilder → PostgrestFilterBuilder) depending on which
// methods have been called. Using `any` here keeps the call sites readable
// at the cost of strict typing inside fetchWindow — acceptable for a script.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

function parseSince(): string {
  const raw = readFlagValue("--since") ?? DEFAULT_LOOKBACK;
  const m = /^(\d+)([hdwm])$/.exec(raw);
  if (!m) {
    throw new Error(`Bad --since value '${raw}'. Use e.g. 7d, 12h, 30m.`);
  }
  const n = Number(m[1]);
  const hours =
    m[2] === "h" ? n :
    m[2] === "d" ? n * 24 :
    m[2] === "w" ? n * 24 * 7 :
    n * 24 * 30;
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function parseLimit(): number {
  const raw = readFlagValue("--limit");
  if (!raw) return DEFAULT_LIMIT;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_LIMIT;
}

function parsePath(): string {
  const v = readFlagValue("--path");
  if (!v) throw new Error("--path=<value> is required for path-summary.");
  return v;
}

// Accepts both `--flag=value` and `--flag value`. The `--flag value`
// form is necessary when running under Node ≥ 18, which otherwise
// strips `--flag=...` arguments that look like Node options (e.g.
// `--path=/tools/...`) before the script ever sees them.
function readFlagValue(flag: string): string | null {
  for (let i = 0; i < process.argv.length; i += 1) {
    const a = process.argv[i];
    if (a === flag) {
      return process.argv[i + 1] ?? null;
    }
    if (a.startsWith(`${flag}=`)) {
      return a.slice(flag.length + 1);
    }
  }
  return null;
}

function arg(name: string): string | null {
  const a = process.argv.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split("=")[1] : null;
}

function pickSubcommand(): string {
  return process.argv[2] ?? "";
}

function ts(iso: string): string {
  return iso.replace("T", " ").replace(/\..+$/, "");
}

function truncate(s: string | null | undefined, n: number): string {
  if (!s) return "";
  return s.length <= n ? s : `${s.slice(0, n - 1)}…`;
}

function printTable(headers: string[], rows: string[][]): void {
  const widths = headers.map((h, i) =>
    rows.reduce((w, r) => Math.max(w, (r[i] ?? "").length), h.length),
  );
  const fmt = (cells: string[]) =>
    cells.map((c, i) => c.padEnd(widths[i])).join("  ");
  console.log(fmt(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const r of rows) console.log(fmt(r));
}

async function fetchWindow(
  since: string,
  extra: (q: QueryBuilder) => QueryBuilder = (q) => q,
): Promise<Row[]> {
  const supabase = createAdminClient();
  const all: Row[] = [];
  const PAGE = 1000;
  for (let from = 0; from < HARD_CAP; from += PAGE) {
    let q = supabase
      .from("request_logs")
      .select("ts,ip,ua,path,referer,country,method,is_suspicious,suspicion_reason,asn,as_org")
      .order("ts", { ascending: false })
      .range(from, from + PAGE - 1);
    q = q.gte("ts", since);
    q = extra(q);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []) as Row[];
    for (const r of rows) all.push(r);
    if (rows.length < PAGE) break;
  }
  return all;
}

async function cmdBots(): Promise<void> {
  const since = parseSince();
  const limit = parseLimit();
  const rows = await fetchWindow(since, (q) =>
    q.eq("is_suspicious", true).limit(limit),
  );
  if (rows.length === 0) {
    console.log("(no suspicious rows in window)");
    return;
  }
  console.log(`Suspicious rows: ${rows.length} (since ${since})`);
  printTable(
    ["ts", "ip", "country", "path", "reason", "ua"],
    rows.map((r) => [
      ts(r.ts),
      r.ip,
      r.country ?? "",
      truncate(r.path, 48),
      r.suspicion_reason ?? "",
      truncate(r.ua, 60),
    ]),
  );
}

async function cmdTopIps(): Promise<void> {
  const since = parseSince();
  const limit = parseLimit();
  const rows = await fetchWindow(since);
  const counts = new Map<string, { hits: number; susp: number; ua: string; as_org: string | null; last: string }>();
  for (const r of rows) {
    const cur = counts.get(r.ip) ?? { hits: 0, susp: 0, ua: "", as_org: null, last: "" };
    cur.hits += 1;
    if (r.is_suspicious) cur.susp += 1;
    if (!cur.ua && r.ua) cur.ua = r.ua;
    if (r.as_org && !cur.as_org) cur.as_org = r.as_org;
    if (!cur.last || r.ts > cur.last) cur.last = r.ts;
    counts.set(r.ip, cur);
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, limit);
  console.log(`Top ${sorted.length} IPs by hits (of ${rows.length} total rows).`);
  printTable(
    ["ip", "hits", "susp", "as_org", "last_seen", "ua"],
    sorted.map(([ip, c]) => [
      ip,
      String(c.hits),
      String(c.susp),
      truncate(c.as_org, 24),
      ts(c.last),
      truncate(c.ua, 50),
    ]),
  );
}

async function cmdTopAsn(): Promise<void> {
  const since = parseSince();
  const rows = await fetchWindow(since);
  const counts = new Map<string, { hits: number; susp: number; ips: Set<string> }>();
  for (const r of rows) {
    const key = r.as_org ?? r.asn ?? "(unenriched)";
    const cur = counts.get(key) ?? { hits: 0, susp: 0, ips: new Set() };
    cur.hits += 1;
    if (r.is_suspicious) cur.susp += 1;
    cur.ips.add(r.ip);
    counts.set(key, cur);
  }
  const sorted = [...counts.entries()]
    .sort((a, b) => b[1].hits - a[1].hits)
    .slice(0, parseLimit());
  console.log(`Top ${sorted.length} ASN/ORGs by hits. Run scripts/enrich-ips.ts to fill NULL as_org.`);
  printTable(
    ["as_org", "hits", "susp", "unique_ips"],
    sorted.map(([org, c]) => [org, String(c.hits), String(c.susp), String(c.ips.size)]),
  );
}

async function cmdPathSummary(): Promise<void> {
  const since = parseSince();
  const path = parsePath();
  const rows = await fetchWindow(since, (q) => q.eq("path", path));
  if (rows.length === 0) {
    console.log(`(no rows for ${path} in window)`);
    return;
  }
  const byIp = new Map<string, { hits: number; susp: number; ua: string; country: string | null; last: string }>();
  for (const r of rows) {
    const cur = byIp.get(r.ip) ?? { hits: 0, susp: 0, ua: "", country: null, last: "" };
    cur.hits += 1;
    if (r.is_suspicious) cur.susp += 1;
    if (!cur.ua && r.ua) cur.ua = r.ua;
    if (r.country && !cur.country) cur.country = r.country;
    if (!cur.last || r.ts > cur.last) cur.last = r.ts;
    byIp.set(r.ip, cur);
  }
  const countries = new Map<string, number>();
  for (const r of rows) {
    const k = r.country ?? "??";
    countries.set(k, (countries.get(k) ?? 0) + 1);
  }
  const countryDist = [...countries.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `${c}=${n}`)
    .join(" ");

  console.log(`Path: ${path}`);
  console.log(`Window: ${since} → now`);
  console.log(`Rows: ${rows.length} | Unique IPs: ${byIp.size} | Countries: ${countryDist}`);

  const sorted = [...byIp.entries()].sort((a, b) => b[1].hits - a[1].hits).slice(0, parseLimit());
  printTable(
    ["ip", "hits", "susp", "country", "last_seen", "ua"],
    sorted.map(([ip, c]) => [
      ip,
      String(c.hits),
      String(c.susp),
      c.country ?? "",
      ts(c.last),
      truncate(c.ua, 50),
    ]),
  );
}

async function main() {
  const sub = pickSubcommand();
  switch (sub) {
    case "bots": return cmdBots();
    case "top-ips": return cmdTopIps();
    case "top-asn": return cmdTopAsn();
    case "path-summary": return cmdPathSummary();
    default:
      throw new Error(
        `Unknown subcommand '${sub}'. Use one of: bots, top-ips, top-asn, path-summary.`,
      );
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});