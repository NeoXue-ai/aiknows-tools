import test from "node:test";
import assert from "node:assert/strict";
import { buildTitle, deriveMetaDescription } from "../features/catalog/seo";
import { readContent } from "../scripts/catalog/source";
import type { Tool } from "../features/catalog/types";

const records = readContent();
const tool: Tool = {
  ...records[0],
  name: "Atlas",
  tagline: null,
  description: null,
  primary_category: "writing-content",
  subcategory: "ai-writer",
  sub: "AI Writer",
  editorial: undefined,
};
const summary =
  "Explore Atlas in the AI Writer category on AIKnows, with product information, related tools and a link to the official website.";

test("unreviewed source prose cannot control search metadata", () => {
  for (const text of [
    "Atlas drafts and revises documents.",
    "Atlas is the world's best AI platform.",
    "It is officially recognised as a composer by SACEM.",
    "Available in English and Chinese.",
    "Chatbot para WhatsApp Business con IA.",
    "Integraci&#xF3;n oficial API de Meta.",
    "用人工智能生成图片和视频。",
    "Build an AI website in under 30 seconds.",
    "Read documents at up to 4.5× normal reading speed.",
    "A platform far more powerful than Zapier.",
    "YouTube Shorts are one of the biggest ways to discover music.",
    "Instant Temporary Inboxes • Generate email addresses •",
    "Our tool is highly accurate and better than other platforms.",
  ]) {
    const row = { ...tool, tagline: text, description: text };
    assert.equal(buildTitle(row), "Atlas — AI Writer");
    assert.equal(deriveMetaDescription(row), summary);
  }
});

test("metadata preserves genuine version names and canonical task labels", () => {
  const row = {
    ...tool,
    name: "Atlas 2",
    tagline: "Create 3D assets for B2B demos.",
  };
  assert.equal(buildTitle(row), "Atlas 2 — AI Writer");
  assert.match(deriveMetaDescription(row), /Atlas 2/);
  const model = { ...tool, name: "Mochi 1" };
  assert.equal(buildTitle(model), "Mochi 1 — AI Writer");
});

test("obvious promotional tails are removed without shortening real names", () => {
  assert.equal(
    buildTitle({ ...tool, name: "Atlas — The World's Best AI Writing Tool" }),
    "Atlas — AI Writer",
  );
});

test("software structured descriptions use the reviewed product summary", async () => {
  const { toolJsonLd } = await import("../lib/seo/tool-schema");
  const description = "Atlas drafts and revises team documents.";
  const row = {
    ...tool,
    editorial: { seo: { title: "Atlas: AI Writer", description } },
  };
  assert.equal(
    toolJsonLd({
      tool: row,
      categoryName: "Writing & Content",
      siteUrl: "https://aiknows.tools",
    }).description,
    description,
  );
});
