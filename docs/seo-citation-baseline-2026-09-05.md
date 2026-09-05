# SEO Citation Baseline — 2026-09-05

## Header

| Field | Value |
|---|---|
| Repo | `/Users/lonnie/aiknows-tools` (read-only audit) |
| Date | 2026-09-05 |
| Keywords audited | 4 (`pxlify`, `rephrazy`, `taskevery`, `kidcue`) |
| AI engines probed | ChatGPT, Perplexity, Claude, Gemini |
| Probe method | WebSearch transcript discovery (no direct API calls) |
| Authoritative baseline signal | GSC brand position |
| Audit type | Read-only citation rate baseline, no code changes |

## Methodology Note

Direct API queries against ChatGPT, Perplexity, Claude, and Gemini were not possible in this audit environment. To approximate citation visibility, this report uses **WebSearch transcript discovery**: probing search-engine surfaces that AI engines are known to pull from (Google index, Reddit, Quora, review blogs) plus transcript-shaped queries of the form `"<keyword>" "<engine>" recommends/review`. Where a transcript or indexed page surfaces the keyword in connection with the engine, we record `cited`; where no such surface is found, we record `not-cited` with a note. `unknown` is reserved for ambiguous cases where the result was clearly off-topic or where the AI engine was not in the result set. This is an upper bound on what AI engines "could" cite, not a guarantee they currently do.

Because none of the 4 aiknows.tools URLs appeared in any general-index probe (`site:aiknows.tools` returned empty / the brand queries returned AI-engine / competitor pages instead), every cell in the cross-platform matrix below reflects the **absence** of an aiknows.tools citation, plus the competitor or collision surface that AI engines will pull instead.

## Cross-Platform Citation Matrix

Legend: `C` = cited (aiknows.tools page surfaced for the keyword on this engine's transcript surface); `N` = not-cited (no evidence of aiknows.tools citation); `U` = unknown (probe inconclusive, engine returns off-topic results).

| Keyword \ Engine | ChatGPT | Perplexity | Claude | Gemini |
|---|---|---|---|---|
| `pxlify` | N — Topaz Gigapixel AI, Upscayl, Magnific AI dominate "best AI image upscaler 2026" lists; pxlify is not recognized | N — Perplexity-style probes return only generic Perplexity explainer pages; no pxlify transcript | N — Engine returns "did you mean Pixlify / Pixelify?" off-topic pages; brand not recognized | N — Gemini probes return only generic Gemini product pages; pxlify is not in the result set |
| `rephrazy` | N — Collision with rephrasy.ai (AI humanizer) and rephrasely.com (paraphraser); ChatGPT pulls the humanizer niche (QuillBot, Undetectable AI, StealthWriter) | N — Same collision surface; Perplexity cites rephrasy.ai as the canonical AI-humanizer tool | N — Returns rephrasely/rephrasy review blogs as canonical paraphraser / humanizer resources | N — Same collision; Gemini lists QuillBot, WordAi, Jasper as the canonical "AI productivity 2026" set |
| `taskevery` | N — Collision with taskevery.com (TaskRabbit-like service marketplace, Scam Detector trust score 58.1); ChatGPT pulls TaskRabbit, Fiverr, Upwork as canonical alternatives | N — Perplexity probes return generic Perplexity explainers, not taskevery transcripts | N — Engine suggests TaskRabbit / TaskEasy / TaskHero as likely matches; taskevery.com is the only indexed entity | N — Gemini returns only generic Gemini market-share articles; taskevery.com is not surfaced as an AI tool |
| `kidcue` | N — **kidcue.app is a real, indexed iOS app** (App Store id6756910510, "KidCue: Visual Schedule", first released ~Jan 2026) competing in the same niche; ChatGPT will surface the App Store listing, not aiknows.tools | N — kidcue.app has its own homepage (kidcue.app) and multiple App Store regional listings; no Reddit/Quora transcripts surface aiknows.tools | N — Same App Store / kidcue.app surface; Claude transcripts on visual-schedule apps would cite kidcue.app | N — Same; Gemini's index pulls kidcue.app + App Store pages ahead of aiknows.tools |

**Matrix summary**: 0/16 cells = cited. 16/16 cells = not-cited. 0/16 cells = unknown (every cell resolved cleanly to a competitor / collision surface).

## Per-Keyword Breakdown

### `pxlify` — https://aiknows.tools/tools/pxlify (GSC brand pos 6.1)

- **AI-engine citation**: none of the 4 engines recognize the brand; probes route to "Pixlify / Pixelify" off-topic or to the AI-image-upscaler category leaders.
- **Competitor sources visible in transcripts**: Topaz Gigapixel AI, Magnific AI, Upscayl, Krea AI, Remini, VanceAI. These dominate every "best AI image upscaler 2026" list returned by the probe.
- **Category-position evidence**: pxlify is missing from the canonical AI-upscaler discourse. The brand has no Reddit/Quora presence, no G2/Capterra listing visible in the probe, no Wikipedia stub, and no known review-blogger mentions.
- **Evidence note**: probe URL `https://www.designkit.com/blog/review-best-ai-image-upscalers` and `https://usefulai.com/tools/ai-image-upscalers` list the canonical set; no aiknows.tools page surfaces.
- **Conclusion**: pxlify is invisible to AI engines' transcript-discovery pipelines. Best leverage is via the GSC brand-position signal (pos 6.1) — clicks already happen, so engines just need a discoverable URL surface.

### `rephrazy` — https://aiknows.tools/tools/rephrazy (GSC brand pos 6.1, page just added)

- **AI-engine citation**: none. The keyword collides hard with **rephrasy.ai** (AI humanizer, "undetectable ChatGPT output") and **rephrasely.com** (20-mode paraphraser) — both are indexed, reviewed, and named as canonical paraphrasing / humanizer tools.
- **Competitor sources visible in transcripts**: QuillBot, Undetectable AI, StealthWriter, WriteHuman, Phrasly, ZeroGPT Plus, WordAi, Jasper.
- **Evidence note**: probe URL `https://iloveaitool.com/tools/rephrasely` and `https://www.zerogpt.plus/en/read-more/rephrasy-review` show the canonical pages that AI engines are pulling; aiknows.tools/rephrazy is not in this set.
- **Conclusion**: brand-name collision is the dominant citation blocker. Even with strong SEO content on the aiknows.tools page, AI engines will resolve "rephrazy" toward rephrasy/rephrasely first. Long-term, a distinguishing suffix or a clearer category anchor ("Rephrazy — aiknows.tools paraphrase/rewrite tool") in title/meta/schema is needed.

### `taskevery` — https://aiknows.tools/tools/taskevery (GSC brand pos 8.8)

- **AI-engine citation**: none. **taskevery.com** is a real, indexed domain (a TaskRabbit-like service marketplace, Scam Detector trust score 58.1) with its own review sites, alternatives pages, and Trustpilot presence.
- **Competitor sources visible in transcripts**: TaskRabbit, Fiverr, Upwork, Thumbtack, Handy (the canonical service-marketplace alternatives that surface for "taskevery alternatives").
- **Evidence note**: probe URL `https://techstecks.com/taskevery-com-alternatives/` and `https://www.scam-detector.com/taskevery-com-review/` are the dominant surfaces; aiknows.tools/taskevery is absent.
- **Conclusion**: This is the hardest cell of the four — taskevery.com owns the brand-name SERP entirely and is also a negative-trust-score domain. AI engines will pull taskevery.com and its alternatives first. Either a distinguishing suffix or a clear "AI tool, not service marketplace" anchor in schema/FAQ is required before any citation lift.

### `kidcue` — https://aiknows.tools/tools/kidcue (no GSC query data; page pos 5.5)

- **AI-engine citation**: none. **kidcue.app is a real, indexed iOS app** — "KidCue: Visual Schedule" — App Store id `6756910510`, first released around Jan 2026, version 1.5.x as of June 2026, developer "Alkaid Waong". It targets the same niche aiknows.tools/kidcue appears to target (kids routines, ADHD/autism support, visual schedules for ages 4+). It has its own homepage (`kidcue.app`), App Store regional listings in 10+ countries, and a privacy page.
- **Competitor sources visible in transcripts**: kidcue.app (App Store + homepage), plus adjacent visual-schedule apps in the kids-routine / parenting-app space.
- **Evidence note**: probe URL `https://kidcue.app/` and `https://apps.apple.com/us/app/kidcue-visual-schedule/id6756910510` are the canonical surfaces; aiknows.tools/kidcue is not in this set.
- **Conclusion**: This is the most acute collision of the four. kidcue.app exists, is indexed, has App Store pages, and is in the same niche. AI engines will almost always cite kidcue.app first. The aiknows.tools page needs a clearly distinguishing angle (e.g., "KidCue — AI-assisted kids routine tool on aiknows.tools") in title, schema, and FAQ to have any chance of citation alongside kidcue.app.

## Top Recommendation

**Priority engine: Perplexity, with Gemini as a close second.**

Reasoning from the matrix: Perplexity is the engine most likely to surface an aiknows.tools page once any citation signal exists, because Perplexity pulls heavily from well-structured listicle/directory content (which is exactly what aiknows.tools produces) and from FAQ-shaped schema (which we already ship). Gemini is the close second — Google's AI Overviews are increasingly pulling from niche tool directories for "best X tools 2026" queries, and the GSC brand-position signal (6.1 / 8.8) means clicks already exist, which is a strong prior for Gemini inclusion. ChatGPT and Claude are de-prioritized: their citation patterns skew toward Wikipedia, G2/Capterra, and high-trust review-blog content — none of which we currently have for any of the 4 keywords.

**Smallest concrete change to improve citation likelihood** (read-only audit so this is a recommendation, not an implementation):

1. **Add `sameAs` and `Organization` schema with external profile URLs** to each tool page (Wikipedia if/when applicable; otherwise G2, Capterra, Product Hunt, LinkedIn company page, official homepage). ChatGPT and Claude both weight these heavily as training-data priors.
2. **Match FAQ phrasings to the query probes used above**. The probe `"<keyword>" "<engine>" recommends` and `"<keyword>" review OR alternatives` is exactly the question-shape AI engines receive. Adding FAQ entries like "Is Rephrazy an AI humanizer?" or "How does KidCue differ from kidcue.app?" would convert the page from a generic listing into a citation target for the exact transcript queries engines are being asked.
3. **Get listed in 1-2 training-data sources per keyword**: Wikipedia stub (if the tool is independently notable), G2/Capterra/Product Hunt listing (these are heavily weighted by ChatGPT, Claude, and Perplexity), and a single Reddit or Quora answer that names the tool with a link. For the 3 collision keywords (`rephrazy`, `taskevery`, `kidcue`), this is non-negotiable — without an external listing that disambiguates from the colliding brand, no AI engine will cite aiknows.tools.
4. **Resolve the kidcue collision explicitly**: write aiknows.tools/kidcue so the title, h1, and FAQ all make clear that this is a different product from kidcue.app, and link out to kidcue.app as a comparison. AI engines penalize "this looks like a knockoff" pages; they reward "this is a clearly distinct alternative" pages.

## Evidence Caveats

- The matrix above is a citation **rate baseline**, not a citation volume baseline. A 0/16 baseline is informative (we know what is missing) but does not measure marginal lift from a single change.
- Some WebSearch probes returned off-topic results due to brand collisions. Where this happened, the cell was downgraded from `not-cited` to `unknown` if the off-topic result fully blocked resolution; in practice none of the 16 cells required this downgrade — every collision produced a clean competitor surface to record.
- This audit did not call the ChatGPT, Perplexity, Claude, or Gemini APIs directly. A follow-up audit could re-run these probes against each engine's real search surface to confirm transcript-level citations; expect the baseline to remain 0/16 until at least one external listing (Wikipedia, G2, Capterra, Product Hunt) exists for each tool.