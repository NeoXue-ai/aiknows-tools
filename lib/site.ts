// In production set NEXT_PUBLIC_SITE_URL in Vercel (Project → Settings →
// Environment Variables). The default is the Vercel production hostname so
// build-time artifacts (sitemap.xml entries, robots.txt Sitemap directive)
// stay correct even when the env var is missing.
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aiknows-tools.vercel.app";
export const siteUrl = rawSiteUrl.replace(/\s+/g, "").replace(/\/+$/, "");

export const siteName = "aiknows.tools";

export const siteDescription =
  "An evidence-led index of recorded AI tools and directory submission facts. Inspect what is recorded — no popularity ranking, no star ratings.";
