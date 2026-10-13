# English Metadata Refinement Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the focused metadata task and independent review; the parent handles public copy, integration and delivery.

**Goal:** Deliver complete English titles and descriptions with consistent site and sharing copy in existing draft PR #12.

**Architecture:** Store reviewed overrides in `editorial.seo` inside existing JSON records. Keep metadata derivation in `features/catalog/seo.ts` and use `lib/site.ts` for shared brand defaults. Preserve existing static routes and indexing policy.

**Tech Stack:** Next.js 16.2, TypeScript, Git-backed JSON, Node test runner, existing production verifier.

## Task 1: Metadata policy and tool overrides

- [x] Add failing cases for explicit SEO precedence, invalid overrides, identity/version preservation, canonical task labels and source independence. Source prose variations must not alter fallback metadata.
- [x] Run focused tests before implementation and confirm failures for the missing behavior.
- [x] Add `seo?: { title: string; description: string }` to `EditorialEntry` in `features/catalog/types.ts`. Permit and validate it in `features/catalog/validation.ts`.
- [x] Simplify `features/catalog/seo.ts`: use reviewed overrides, otherwise normalized product name and actual taxonomy. Use a complete factual directory summary; remove natural-language source heuristics and title chopping. Preserve genuine long names and versions.
- [x] Add overrides to the ten sourced guides and sixteen long-summary pages, plus the additional official sources documented in `docs/seo-metadata-sources-2026-10-13.md`. Preserve source identity/catalog fields and existing editorial content. Use the shared title template on tool pages.
- [x] Run focused tests and self-review changed titles and descriptions.

## Task 2: Public copy and share cards

- [x] Update shared site defaults, root metadata, manifest and global/product share cards to use AIKnows and the same directory purpose.
- [x] Rewrite metadata and public introductory text for About, FAQ, Submit, Contact and Categories. Keep configured submission/correction links and contact email; describe review without a deadline or guaranteed acceptance.
- [x] Update Collections, Pricing, empty Blog and paused Latest copy; remove the hidden generic SEO footer while preserving indexing policies.
- [x] Render official external resource links independently of comparison content, and use the reviewed/derived summary for SoftwareApplication descriptions.
- [x] Extract pure category metadata policy and test that pagination describes its lists rather than the first-page guide. Give directory pagination page-specific descriptions.
- [x] Format changed source files, without reformatting unrelated homepage layout.

## Task 3: Integration, review and delivery

- [x] Extend `scripts/verify-build.mjs` to compare every tool page's title, description and social tags with the metadata policy, checking unique values and complete titles. Extend validation to public-page metadata.
- [x] Run `NEXT_PUBLIC_SITE_URL=https://aiknows.tools pnpm check` and `NEXT_PUBLIC_SITE_URL=https://aiknows.tools pnpm build`. All 39 tests, type and format checks plus the catalog HTML verifier passed.
- [x] Obtain spec review followed by quality review; fix concrete findings and recheck changed behavior. Final spec and quality reviews passed.
- [x] Restart only the agent-owned preview on 3011; inspect Cursor, About, Glean, the default homepage title and global/product share images. Confirm production HTTP behavior for pagination, search, redirects and missing-page 404s.
- [x] Review the diff and scan changed tracked content for known credential patterns without displaying secret values. All 59 changed/new files passed the pattern scan; existing catalog fields and editorial values remain intact in all 26 changed records.
- [ ] Commit, push the existing branch normally, update and attach PR #12, check remote validation, and update the output delivery note with the verified scope and remaining editorial work.
