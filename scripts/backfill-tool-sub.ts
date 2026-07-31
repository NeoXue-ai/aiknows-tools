/**
 * Backfill the `sub` column on the production `tools` table from
 * data/tools.json. Idempotent: writes only rows whose `sub` is currently
 * NULL or differs from the JSON-recorded value.
 *
 * Run after the migration 20260801000001_add_tool_sub.sql has been applied
 * to the target Supabase project.
 *
 * Usage:
 *   pnpm tsx --env-file=.env.local scripts/backfill-tool-sub.ts
 *   pnpm tsx --env-file=.env.local scripts/backfill-tool-sub.ts --dry-run
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createAdminClient } from "@/lib/supabase/admin";

const TOOLS_PATH = resolve(process.cwd(), "data/tools.json");

const DRY_RUN = process.argv.includes("--dry-run");

type JsonTool = {
  slug?: string;
  name?: string;
  sub?: string | null;
  primary_category?: string;
};

async function loadPairs(): Promise<{ slug: string; sub: string }[]> {
  const raw = await readFile(TOOLS_PATH, "utf8");
  const tools = JSON.parse(raw) as JsonTool[];
  const out: { slug: string; sub: string }[] = [];
  for (const t of tools) {
    if (!t.slug || !t.sub) continue;
    out.push({ slug: t.slug, sub: t.sub });
  }
  return out;
}

async function main() {
  const pairs = await loadPairs();
  if (pairs.length === 0) {
    console.log("No (slug, sub) pairs in data/tools.json — nothing to backfill.");
    return;
  }

  console.log(`Loaded ${pairs.length} (slug, sub) pairs from data/tools.json.`);

  if (DRY_RUN) {
    console.log("--dry-run set; printing first 5 pairs and exiting.");
    for (const p of pairs.slice(0, 5)) {
      console.log(`  ${p.slug} → ${p.sub}`);
    }
    return;
  }

  const supabase = createAdminClient();

  // Pull existing rows so we skip rows whose sub already matches.
  const { data: rows, error } = await supabase
    .from("tools")
    .select("slug, sub")
    .in(
      "slug",
      pairs.map((p) => p.slug),
    );
  if (error) throw error;

  const existing = new Map<string, string | null>(
    (rows ?? []).map((r) => [r.slug as string, (r.sub as string | null) ?? null]),
  );

  const toUpdate: { slug: string; sub: string }[] = [];
  let unchanged = 0;
  let missing = 0;
  for (const p of pairs) {
    if (!existing.has(p.slug)) {
      missing += 1;
      continue;
    }
    if (existing.get(p.slug) === p.sub) {
      unchanged += 1;
      continue;
    }
    toUpdate.push(p);
  }

  console.log(`Plan: ${toUpdate.length} update, ${unchanged} unchanged, ${missing} missing in Supabase.`);
  if (toUpdate.length === 0) {
    console.log("Nothing to update.");
    return;
  }

  const BATCH = 200;
  for (let i = 0; i < toUpdate.length; i += BATCH) {
    const batch = toUpdate.slice(i, i + BATCH);
    const updates = await Promise.all(
      batch.map((p) =>
        supabase
          .from("tools")
          .update({ sub: p.sub })
          .eq("slug", p.slug)
          .then((res) => ({ slug: p.slug, res })),
      ),
    );
    const failed = updates.filter((u) => u.res.error);
    if (failed.length > 0) {
      console.error(`Batch ${i}-${i + BATCH}: ${failed.length} failed:`);
      for (const f of failed) console.error(`  ${f.slug}: ${f.res.error?.message}`);
      throw new Error("Backfill failed; aborting.");
    }
    console.log(`  Wrote batch ${i + batch.length}/${toUpdate.length}`);
  }

  console.log(`Backfill complete: ${toUpdate.length} rows updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
