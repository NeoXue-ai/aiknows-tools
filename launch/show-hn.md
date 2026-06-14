# Show HN — aiknows.tools

**Title:** Show HN: aiknows.tools – 121 AI tools and 53 directories, hand-curated

**URL:** https://aiknows.tools

**Text:**

Hi HN — I shipped a curated directory of 121 AI tools and 53 submission directories, free and open.

**Background:**

When I shipped my last AI side project, I spent 3 days hunting for directories to submit to. Every "Top 100 AI Directories" list I found was either 6+ months old, full of dead links, or listed with no useful metadata. The good information was scattered across Twitter threads and IndieHackers comments.

So I built the resource I wanted.

**What it has:**

- 121 AI tools, manually picked, across 8 categories (writing, image/video, code, SEO, ecommerce, productivity, research, business). Each with pricing type, tags, and a verified badge.
- 53 submission directories with DR, free/paid/both, dofollow/nofollow, listing speed, niche focus, and a direct submit URL. The directories page is the flagship — built like a launch checklist, not a list.
- A "submit your tool" flow with manual review (2 business days).

**What I learned curating it:**

1. The best directories by DR (Product Hunt, G2, Capterra) are not specifically AI directories — they're general SaaS directories. AI-specific directories (Futurepedia, FutureTools, AI Tools fyi) are mostly DR 40-65 and most have stopped accepting submissions or charge for placement.
2. The "free + dofollow + active" intersection is tiny. Most directories are 2 of 3.
3. There's no canonical source. Every list conflicts. I had to verify each one by hand.

**Stack:**

Next.js 16 (App Router) + Supabase (RLS via `is_admin()` JWT claim) + Vercel. The curation is the moat; the stack is just CRUD.

**What I'd love feedback on:**

- Is the directories page useful? Does it have the columns you actually need when choosing where to submit?
- Anything obviously missing — a column, a category, a filter?
- Anyone want a free featured listing in exchange for brutal feedback? (Comment or DM.)

Free, no signup, no paywall. https://aiknows.tools
