-- Sub-category layer on top of primary_category.
-- Populated by scripts/backfill-tool-sub.ts from data/tools.json (or
-- the reclassify-categories script next time it runs). Read path
-- (lib/public-catalog.ts) keeps a JSON fallback so legacy rows
-- without a sub value still surface in the sub-category pages.

ALTER TABLE tools
  ADD COLUMN IF NOT EXISTS sub TEXT;

CREATE INDEX IF NOT EXISTS tools_sub_idx
  ON tools(sub)
  WHERE sub IS NOT NULL;
