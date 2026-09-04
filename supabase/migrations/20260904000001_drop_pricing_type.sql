-- Drop pricing_type from public-facing tables.
-- We never had a reliable source for this column, and the front-end now
-- omits it everywhere. Keeping the column would invite stale or guessed
-- values. Dropping it forces any future reintroduction to be a deliberate
-- schema change rather than a drift hazard.
--
-- pricing_detail (free-form text) is kept — it is rarely populated but
-- when it is, it carries editor-reviewed detail that we don't want to
-- throw away.

ALTER TABLE tools       DROP COLUMN pricing_type;
ALTER TABLE submissions DROP COLUMN pricing_type;
