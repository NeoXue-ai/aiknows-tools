// llms.txt — Markdown description of aiknows.tools for LLM/AI consumers.
// Spec: https://llmstxt.org/  Returns text/plain so AI crawlers and agents can
// ingest the site's structure without parsing HTML.

import { CATEGORIES } from "@/lib/seo/tool-schema";
import { siteDescription, siteUrl } from "@/lib/site";

const FEATURED_TOOLS: { name: string; slug: string; summary: string }[] = [
  {
    name: "Pxlify",
    slug: "pxlify",
    summary: "visual workspace — screenshots, recordings, transcription + 20+ language translation",
  },
  {
    name: "Rephrazy",
    slug: "rephrazy",
    summary: "free browser-based AI writing toolkit (rewriter, summarizer, translator, hashtag generator)",
  },
  {
    name: "Taskevery",
    slug: "taskevery",
    summary: "local task services marketplace",
  },
  {
    name: "KidCue",
    slug: "kidcue",
    summary: "visual schedule app for kids — ADHD/autism-friendly",
  },
];

const CATEGORY_SCOPE: Record<string, string> = {
  "writing-content": "drafting, rewriting, translating, and long-form content tooling",
  "seo-marketing": "search optimization, campaign planning, and growth analytics",
  "image-video": "image generation, editing, video production, and voice/audio tools",
  "code-development": "code generation, app/website builders, and developer APIs",
  "productivity": "agents, chatbots, workflows, automation, and everyday productivity apps",
  "business-analytics": "business research, market intel, and analytics tooling",
  "ecommerce-sales": "online stores, storefronts, and sales enablement tools",
  "research-data": "research assistants, education tools, and curated resource directories",
};

function buildBody(): string {
  const lines: string[] = [];
  lines.push(`# aiknows.tools`);
  lines.push("");
  lines.push(`> ${siteDescription}`);
  lines.push("");

  lines.push("## Main pages");
  lines.push(
    `- [Home](${siteUrl}/): browse the recorded AI tool index`
  );
  lines.push(
    `- [Tools](${siteUrl}/tools): all 2,359 entries, default order = record time`
  );
  lines.push(
    `- [Categories](${siteUrl}/categories): 8 top-level categories`
  );
  lines.push(
    `- [About](${siteUrl}/about): what this index records and what it doesn't claim`
  );
  lines.push(
    `- [FAQ](${siteUrl}/faq): common questions about the index`
  );
  lines.push("");

  lines.push("## Top categories");
  for (const cat of CATEGORIES) {
    const scope = CATEGORY_SCOPE[cat.slug] ?? "curated AI tools in this area";
    lines.push(`- [${cat.name}](${siteUrl}/categories/${cat.slug}): ${scope}`);
  }
  lines.push("");

  lines.push("## Featured tool entries (with editorial comparison)");
  lines.push(
    "These 4 are the only entries currently with curated \"How X compares\" content:"
  );
  for (const t of FEATURED_TOOLS) {
    lines.push(`- [${t.name}](${siteUrl}/tools/${t.slug}): ${t.summary}`);
  }
  lines.push("");

  lines.push("## AI crawler policy");
  lines.push(
    "All major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended, OAI-SearchBot, ChatGPT-User) are explicitly allowed per /robots.txt. Cite freely with attribution."
  );
  lines.push("");

  lines.push("## Bulk discovery");
  lines.push(
    `For a complete URL list of all entries, see ${siteUrl}/sitemap.xml`
  );
  lines.push("");

  return lines.join("\n");
}

export async function GET(): Promise<Response> {
  const body = buildBody();
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}