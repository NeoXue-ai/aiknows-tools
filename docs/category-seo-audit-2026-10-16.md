# English category landing-page audit

User examples:
- https://aiknows.tools/categories/ai-summarizer
- https://huntifyai.com/zh-CN/categories/ai-image-api

## Confirmed findings

The previous category registry contained five authored guides for97 taxonomy entries. All other base category pages used a short taxonomy description and generic directory metadata. The ai-summarizer page lacked a definition, task-specific selection guidance, usage examples, workflow and product-oriented questions.

The competitor's category includes a tool list followed by a category definition, capabilities, audiences, operating explanation and FAQs. Use this information hierarchy as a reference; no competitor prose, vendor performance assertions, rankings or prices are copied.

Existing foundations already include static HTML tool cards, page-specific canonical URLs, HTML pagination, breadcrumbs, populated-category sitemap membership, and noindex/follow for empty categories. Keep them and test them; a longer article does not replace these foundations.

Five catalog assignments were corrected after reading official sources. See category-classification-sources-2026-10-16.md. Do not infer that the rest of the994-tool taxonomy has been fully audited.

## Implemented direction

- One maintainable JSON guide per existing category, with a shared strict schema and renderer.
- Distinct titles/descriptions shared with OpenGraph/Twitter metadata.
- Original definition, four capabilities, audiences, selection criteria, three workflow steps, five or more FAQs, and related categories.
- First-page-only editorial content; pagination retains its own list metadata and self canonical.
- CollectionPage JSON-LD describes the actual list in mainEntity; breadcrumbs remain.
- Empty-category links removed from category navigation and related-guide navigation. Empty category URLs retain noindex and sitemap exclusion.
- Product list corrections align Summarizer with Blinkist, Readwise and Scholarcy; Image API with fal.ai and Replicate.

## Indexing diagnosis limits

The user's reported “Discovered – currently not indexed” status means Google knows the URL but has not crawled it yet. It does not establish that Google assessed and rejected this page's text. Crawl health, demand, URL inventory, site popularity, content value and uniqueness can all matter.

Read-only requests from this execution environment returned403 for both the user's site and the competitor. That does not establish Googlebot's response. No production access setting was changed. GSC URL Inspection could not run because its configured client environment variables are absent; no secrets were opened. This audit therefore does not claim to know last crawl time, Google-selected canonical, hostload, or the specific reason Google's crawl was deferred.

Primary guidance:
- https://support.google.com/webmasters/answer/7440203?hl=en (Page indexing report, Discovered status)
- https://developers.google.com/crawling/docs/crawl-budget (crawl demand, URL inventory and serving health)

After an authorized production release, verify live responses and rendered content, then inspect representative category URLs in GSC and compare the next crawl/indexing reports. Do not claim guaranteed indexing, submit unchanged URLs repeatedly, fabricate sitemap freshness, or treat keyword repetition as an indexing fix.
