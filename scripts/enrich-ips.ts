/**
 * Enrich request_logs rows with ASN / org data from ip-api.com.
 *
 * Looks up each distinct IP that has NULL asn / as_org and writes back
 * `asn` and `as_org`. Free tier rate limit: 45 req/min — we cap at 40 to
 * stay safely under.
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/enrich-ips.ts              # all NULL rows
 *   pnpm tsx --env-file=.env.local scripts/enrich-ips.ts --since 7d   # only last 7 days
 *   pnpm tsx --env-file=.env.local scripts/enrich-ips.ts --limit 100  # cap the work
 *   pnpm tsx --env-file=.env.local scripts/enrich-ips.ts --dry-run     # show plan, no writes
 */

import { createAdminClient } from "@/lib/supabase/admin";

const RATE_DELAY_MS = 1500; // 1500ms ≈ 40 req/min, safely under the 45/min cap.
const DEFAULT_LIMIT = 500;

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");

function parseSince(): string | null {
  const arg = process.argv.find((a) => a.startsWith("--since="));
  if (!arg) return null;
  const value = arg.split("=")[1];
  const m = /^(\d+)([hdwm])$/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2];
  const hours =
    unit === "h" ? n :
    unit === "d" ? n * 24 :
    unit === "w" ? n * 24 * 7 :
    n * 24 * 30;
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function parseLimit(): number {
  const arg = process.argv.find((a) => a.startsWith("--limit="));
  if (!arg) return DEFAULT_LIMIT;
  return Number(arg.split("=")[1]) || DEFAULT_LIMIT;
}

type IpRow = { ip: string };

type EnrichResult = {
  ip: string;
  asn: string | null;
  as_org: string | null;
  status: string;
};

async function fetchEnrichment(ip: string): Promise<EnrichResult> {
  const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,as,asname,org,query`;
  const res = await fetch(url);
  if (!res.ok) {
    return { ip, asn: null, as_org: null, status: `http-${res.status}` };
  }
  const body = (await res.json()) as {
    status?: string;
    message?: string;
    as?: string;
    asname?: string;
    org?: string;
    query?: string;
  };
  if (body.status === "fail") {
    return { ip, asn: null, as_org: null, status: `fail:${body.message ?? "unknown"}` };
  }
  return {
    ip,
    asn: body.as ?? null,
    as_org: body.asname ?? body.org ?? null,
    status: "ok",
  };
}

async function main() {
  const since = parseSince();
  const limit = parseLimit();
  const supabase = createAdminClient();

  let query = supabase
    .from("request_logs")
    .select("ip")
    .is("asn", null)
    .order("ts", { ascending: false })
    .limit(limit * 5); // oversample — distinct() is post-DB

  if (since) query = query.gte("ts", since);

  const { data, error } = await query;
  if (error) throw error;

  const allIps = (data ?? []).map((r) => (r as IpRow).ip);
  const uniqueIps = Array.from(new Set(allIps)).slice(0, limit);

  console.log(`Found ${allIps.length} rows, ${uniqueIps.length} distinct IPs needing enrichment.`);
  if (uniqueIps.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (DRY_RUN) {
    console.log("--dry-run set; first 10 IPs that would be looked up:");
    for (const ip of uniqueIps.slice(0, 10)) console.log(`  ${ip}`);
    return;
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < uniqueIps.length; i += 1) {
    const ip = uniqueIps[i];
    const result = await fetchEnrichment(ip);

    if (result.status === "ok" && (result.asn || result.as_org)) {
      const { error: updateErr } = await supabase
        .from("request_logs")
        .update({ asn: result.asn, as_org: result.as_org })
        .eq("ip", result.ip)
        .is("asn", null);
      if (updateErr) {
        console.error(`  ${ip} → DB update failed: ${updateErr.message}`);
        fail += 1;
      } else {
        ok += 1;
      }
    } else {
      fail += 1;
    }

    if ((i + 1) % 20 === 0 || i === uniqueIps.length - 1) {
      console.log(`  ${i + 1}/${uniqueIps.length} ok=${ok} fail=${fail}`);
    }

    if (i < uniqueIps.length - 1) {
      await new Promise((r) => setTimeout(r, RATE_DELAY_MS));
    }
  }

  console.log(`Done. ${ok} enriched, ${fail} failed/empty.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});