/**
 * Seed local Supabase with tools and directories.
 *
 * Usage:
 *   pnpm seed                          # full seed (idempotent via slug)
 *   pnpm seed --tools-only             # only tools
 *   pnpm seed --directories-only       # only directories
 *
 * Reads:
 *   data/tools.json
 *   data/directories.json
 *
 * Writes via service-role key (SUPABASE_SERVICE_ROLE_KEY) — bypasses RLS.
 */

import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type SubmissionType = "free" | "paid" | "both";
type LinkType = "dofollow" | "nofollow";
type DirectoryStatus = "active" | "dead" | "unknown";
type ToolStatus = "pending" | "approved" | "rejected";

interface SeedTool {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string;
  logo_url: string | null;
  primary_category: string;
  tags: string[];
  pricing_detail: string | null;
  source: string | null;
}

type ToolsSnapshot = { tools?: SeedTool[] } | SeedTool[];

interface SeedDirectory {
  slug: string;
  name: string;
  url: string;
  dr: number | null;
  submission_type: SubmissionType | null;
  paid_price: string | null;
  link_type: LinkType | null;
  listing_speed: string | null;
  niche_focus: string | null;
  submit_url: string | null;
  notes: string | null;
}

async function loadJson<T>(path: string): Promise<T> {
  const raw = await readFile(resolve(process.cwd(), path), "utf8");
  return JSON.parse(raw) as T;
}

function logStep(step: string, msg: string) {
  console.log(`[${step}] ${msg}`);
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const toolsOnly = args.has("--tools-only");
  const dirsOnly = args.has("--directories-only");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // --- tools ---
  if (!dirsOnly) {
    logStep("tools", "loading data/tools.json");
    const toolsRaw = await loadJson<ToolsSnapshot>("data/tools.json");
    const tools = Array.isArray(toolsRaw) ? toolsRaw : toolsRaw.tools ?? [];
    logStep("tools", `seeding ${tools.length} tools…`);

    const rows = tools.map((t) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      description: t.description,
      url: t.url,
      logo_url: t.logo_url,
      primary_category: t.primary_category,
      tags: t.tags,
      pricing_detail: t.pricing_detail,
      source: t.source,
    }));

    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error: insertError } = await supabase
        .from("tools")
        .upsert(
          chunk.map((tool) => ({
            ...tool,
            status: "approved" satisfies ToolStatus,
          })),
          { onConflict: "slug", ignoreDuplicates: true },
        );
      if (insertError) {
        console.error("tools insert error:", insertError);
        process.exit(1);
      }

      const { error: upsertError } = await supabase
        .from("tools")
        .upsert(chunk, { onConflict: "slug" });
      if (upsertError) {
        console.error("tools content upsert error:", upsertError);
        process.exit(1);
      }
      logStep("tools", `  ✓ ${i + chunk.length}/${rows.length}`);
    }
  }

  // --- directories ---
  if (!toolsOnly) {
    logStep("directories", "loading data/directories.json");
    const dirs = await loadJson<SeedDirectory[]>("data/directories.json");
    logStep("directories", `seeding ${dirs.length} directories…`);

    const rows = dirs.map((d) => ({
      slug: d.slug,
      name: d.name,
      url: d.url,
      dr: d.dr,
      submission_type: d.submission_type,
      paid_price: d.paid_price,
      link_type: d.link_type,
      listing_speed: d.listing_speed,
      niche_focus: d.niche_focus,
      submit_url: d.submit_url,
      notes: d.notes,
    }));

    const { error: insertError } = await supabase
      .from("directories")
      .upsert(
        rows.map((directory) => ({
          ...directory,
          status: "active" satisfies DirectoryStatus,
        })),
        { onConflict: "slug", ignoreDuplicates: true },
      );
    if (insertError) {
      console.error("directories insert error:", insertError);
      process.exit(1);
    }

    const { error: upsertError } = await supabase
      .from("directories")
      .upsert(rows, { onConflict: "slug" });
    if (upsertError) {
      console.error("directories content upsert error:", upsertError);
      process.exit(1);
    }
    logStep("directories", `  ✓ ${rows.length}/${rows.length}`);
  }

  logStep("done", "seed complete");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
