import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const AI_BOTS = [
  // search-augmented citation crawlers — these power Google AI Overviews,
  // Perplexity, Apple Intelligence. Allow by default so AI engines can
  // cite our 2,359 cataloged entries.
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  // training crawlers — public catalog data, opt-in helps with citation
  // coverage as models refresh.
  "GPTBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "cohere-ai",
  "CCBot",
  "Bytespider",
  "Meta-ExternalAgent",
  "Amazonbot",
  // social/assistant preview bots
  "FacebookBot",
  "Twitterbot",
  "LinkedInBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/*", "/api/*", "/login", "/auth"],
      },
      // Explicit allow for AI crawlers so they are not subject to any
      // future framework-default changes. Same disallow set as the
      // generic rule.
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/" as const,
        disallow: ["/admin/*", "/api/*", "/login", "/auth"],
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}