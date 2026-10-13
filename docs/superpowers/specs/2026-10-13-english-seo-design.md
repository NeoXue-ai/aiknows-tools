# English SEO first release

Approved direction: the user accepted the page audit, document critique and English-first approach, then asked to prepare optimization. This release starts from the user's 994-tool local catalog at 59ebca4. Preserve all existing catalog and screenshot edits. Keep Git-managed content and static Next.js routes.

Deliverables:

1. Static browse pages at /tools/page/N and /categories/SLUG/page/N, containing the correct 24-card slice, HTML pagination and self canonical. Page 1 remains at the existing base URL; invalid pages return 404. Legacy pagination URLs redirect to their corresponding browse URL. Search/filter/sort requests use /search, which is noindex, follow; presentation-only view changes stay on the browse URL.
2. Empty blog remains accessible but noindex and omitted from sitemap. Sitemap reflects the latest catalog and generated page URLs. Site URL configuration has one source. Missing removed tools return 404; no blanket homepage redirects.
3. Optional editorial guide records support sourced features, use cases, platforms, pricing notes, limitations, checked date and deliberate alternatives. Validate data and references at build time. Existing editorial comparison records remain supported. First ten guides: Cursor, GitHub Copilot, ChatGPT, Claude, Midjourney, Ideogram, Runway, NotebookLM, Perplexity Search, Canva. All facts are checked against official sources; no invented prices, ratings or usage statistics.
4. Five concise category guides: image generators, video generators, developer tools, AI chatbots and research tools, using the actual taxonomy slugs. Provide selection criteria and product questions, with related links.
5. Preserve the current visual system. Supplement the existing details with useful product sections, replace record-field questions with product questions, select relevant related tools, and make schema/metadata truthful. No new accounts, backend database, payment flow or fabricated freshness.

Verification: existing unit tests, regression tests for pagination/search destinations and guide references; typecheck/format; production build assertions covering every static browse slice and canonical, noindex pages, ten guide pages and 994 tool URLs. Run a local production preview on an unused port; verify 200/308/404 behavior and a working search. Independent review before delivery. Publish or merge only after a concrete reviewed result is available.
