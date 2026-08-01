# aiknows.tools

An evidence-led index of recorded AI tools and directory submission facts. Inspect what is recorded — no popularity ranking, no star ratings.

Production: [aiknows.tools](https://aiknows-tools.vercel.app) · Stack: Next.js 16 (App Router) · Supabase · Tailwind · Map Legend design system

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Required env vars (see `.env.local.example`):

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — DB + auth
- `NEXT_PUBLIC_SITE_URL` — used for canonical URLs and OG metadata
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — registered domain on plausible.io (leave empty in dev to skip)

## Project layout

```
app/             Next.js App Router pages, route groups, file conventions
components/      UI primitives, site sections, OG/Twitter image renderer
lib/             Domain logic, Supabase client, SEO helpers
  seo/           pageMetadata(), JSON-LD builders (WebSite, ItemList, SoftwareApplication, BreadcrumbList)
  public-catalog.ts  Read-only catalog queries for the public site
supabase/        SQL migrations, RLS policies
DESIGN.md        Map Legend design tokens — read before any UI change
AGENTS.md        Next.js 16 conventions reminder
launch/          Deploy + launch marketing assets (runbook, copy)
```

## SEO system

Every public page declares metadata via `pageMetadata()` in `lib/seo/metadata.ts`. The root layout (`app/layout.tsx`) provides the title template `"%s | aiknows.tools"` so each page passes only the bare title.

OG and Twitter images:

- Root defaults live in `app/opengraph-image.tsx` + `app/twitter-image.tsx`, rendered with the shared `OgCard` helper in `lib/seo/og-card.tsx`
- Per-tool dynamic OG image lives in `app/(public)/tools/[slug]/opengraph-image.tsx` (`force-dynamic`, fetches by slug)

JSON-LD per page is emitted as **one schema per `<script type="application/ld+json">` tag** — do not serialize arrays into a single script. Schema.org spec violation if you do.

Sitemap: `app/sitemap.ts` driven by `lib/sitemap-data.ts`. Filters empty sub-categories. Submit the production sitemap to Google Search Console after deploy.

## Plausible analytics

The root layout conditionally renders `<Plausible domain={...} />` when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. To enable:

1. Sign up at [plausible.io](https://plausible.io) and register the production hostname (e.g. `aiknows-tools.vercel.app`)
2. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in:
   - Local `.env.local` (for local dev verification)
   - Vercel project settings → Environment Variables (for production)
3. Redeploy. Visit the site once and confirm events show up in the Plausible dashboard

The Plausible script is a third-party analytics dependency and is **not** part of the `pageMetadata()` helper — keep it in `app/layout.tsx` only.

## Deploy

End-to-end deploy steps live in [`launch/deploy-runbook.md`](./launch/deploy-runbook.md). That runbook covers DB migrations, seeding, Vercel project linking, and DNS.

## Post-deploy: Google Search Console

1. Visit [Google Search Console](https://search.google.com/search-console) and add the property using the production URL
2. Verify ownership via DNS TXT record (recommended for subdomain migrations)
3. Submit `https://aiknows.tools/sitemap.xml` under Sitemaps
4. Use URL Inspection to request indexing for the top 5 pages (`/`, `/tools`, `/categories`, `/tools/<top-slug>`, `/directories`)
5. Monitor Coverage and Enhancements for crawl errors and structured data issues

## Conventions

- Read [DESIGN.md](./DESIGN.md) before any visual change. Font, color, and spacing tokens are defined there.
- Read [AGENTS.md](./AGENTS.md) for Next.js 16 reminders (breaking changes from earlier versions).
- Outbound links in tool/directory records carry `rel="noopener noreferrer nofollow"` — keep that consistent across new components.