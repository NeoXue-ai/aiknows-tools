-- =========================================================================
-- request_logs: per-request capture for bot / forensic analysis
--
-- Populated by proxy.ts on every dynamic request (fire-and-forget via
-- Next.js 16 NextFetchEvent.waitUntil). Used to investigate suspicious
-- traffic patterns (e.g. /tools/rcmp-eligibility-checker spike in Aug 2026)
-- and to back-fill ASN data via scripts/enrich-ips.ts.
--
-- ip / ua are sensitive (PII under GDPR/PIPL). Keep raw values for forensic
-- purposes, but plan a retention cleanup job before they pile up.
-- =========================================================================

create table if not exists public.request_logs (
  id               bigserial primary key,
  ts               timestamptz not null default now(),
  ip               inet not null,
  ua               text,
  path             text not null,
  referer          text,
  country          text,
  method           text,
  is_suspicious    boolean not null default false,
  suspicion_reason text,
  asn              text,
  as_org           text
);

create index if not exists request_logs_ts_idx
  on public.request_logs (ts desc);

create index if not exists request_logs_ip_idx
  on public.request_logs (ip);

create index if not exists request_logs_path_idx
  on public.request_logs (path);

create index if not exists request_logs_susp_idx
  on public.request_logs (is_suspicious)
  where is_suspicious = true;

alter table public.request_logs enable row level security;
-- No policies. Anon / authenticated denied. Reads / writes go through the
-- service-role key (createAdminClient) only.