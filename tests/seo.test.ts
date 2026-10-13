import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogQuery } from "../features/catalog/query";
import { pageMetadata } from "../lib/seo/metadata";
import { validateCatalog, validateTool } from "../features/catalog/validation";
import { readContent } from "../scripts/catalog/source";
import { buildTitle, deriveMetaDescription } from "../features/catalog/seo";
import type { Tool } from "../features/catalog/types";

const metadataTool: Tool = {
  ...readContent()[0],
  slug: "atlas",
  name: "Atlas",
  tagline: "An AI writing assistant for teams.",
  description: "Atlas helps teams draft and revise documents.",
  primary_category: "writing-content",
  subcategory: "ai-writer",
  sub: "AI Writer",
  editorial: undefined,
};

test("editorial SEO titles take precedence over scraped product copy", () => {
  const title = "Atlas: AI Writing Assistant, Features & Plans";
  assert.equal(
    buildTitle({
      ...metadataTool,
      editorial: { seo: { title, description: "Draft and revise documents." } },
    }),
    title,
  );
});

test("editorial SEO descriptions take precedence over scraped product copy", () => {
  const description =
    "Atlas helps teams draft and revise documents in one workspace.";
  assert.equal(
    deriveMetaDescription({
      ...metadataTool,
      editorial: { seo: { title: "Atlas: AI Writing Assistant", description } },
    }),
    description,
  );
});

test("unreviewed metadata uses the recorded task rather than scraped prose", () => {
  assert.equal(buildTitle(metadataTool), "Atlas — AI Writer");
  assert.equal(
    deriveMetaDescription(metadataTool),
    "Explore Atlas in the AI Writer category on AIKnows, with product information, related tools and a link to the official website.",
  );
});

test("existing complete neutral titles in a product name remain intact", () => {
  const name = "Atlas — AI Writing Assistant for Teams";
  assert.equal(buildTitle({ ...metadataTool, name }), name);
});

test("long genuine product names remain intact instead of being split or cut", () => {
  const name =
    "The International Research Institute — Advanced Document Analysis Edition";
  assert.equal(buildTitle({ ...metadataTool, name }), name);
});

test("unknown source and presentation labels do not replace the recorded category", () => {
  assert.equal(
    buildTitle({
      ...metadataTool,
      tagline: null,
      description: null,
      subcategory: null,
      sub: "Unknown label",
    }),
    "Atlas — Writing & Content",
  );
});

test("legacy product names are cleaned of encoded markup before metadata", () => {
  assert.equal(
    buildTitle({ ...metadataTool, name: "Atl&#x61;s <b>2</b>" }),
    "Atlas 2 — AI Writer",
  );
});

test("optional editorial SEO validates without changing existing catalog fields", () => {
  const tool = {
    ...metadataTool,
    editorial: {
      seo: {
        title: "Atlas: AI Writing Assistant",
        description: "Draft and revise documents with Atlas.",
      },
      faqs: [{ question: "What is Atlas?", answer: "A writing assistant." }],
    },
  };
  const { sub: _sub, ...record } = tool;
  assert.deepEqual(validateTool(record), record);
});

test("editorial length preferences do not reject complete long text", () => {
  const { sub: _sub, ...record } = metadataTool;
  assert.doesNotThrow(() =>
    validateTool({
      ...record,
      editorial: {
        seo: {
          title:
            "The International Research Institute Advanced Document Analysis Edition: Research Assistant",
          description:
            "The International Research Institute Advanced Document Analysis Edition helps researchers organize extensive document collections, discuss their source material, and review supporting references.",
        },
      },
    }),
  );
});

test("editorial SEO requires both nonempty text fields", () => {
  const { sub: _sub, ...record } = metadataTool;
  for (const seo of [
    {},
    { title: "Atlas" },
    { description: "Draft documents." },
    { title: " ", description: "Draft documents." },
    { title: "Atlas", description: "" },
    { title: 42, description: "Draft documents." },
    { title: "Atlas", description: null },
  ]) {
    assert.throws(
      () => validateTool({ ...record, editorial: { seo } }),
      /non-empty text/,
    );
  }
});

test("editorial SEO rejects markup and truncated copy in either field", () => {
  const { sub: _sub, ...record } = metadataTool;
  for (const value of [
    "<b>Atlas</b>",
    "[Atlas](https://example.com)",
    "**Atlas**",
    "*Atlas*",
    "_Atlas_",
    "# Atlas",
    "> Atlas",
    "&lt;b&gt;Atlas&lt;/b&gt;",
    "Atlas\nAI Writer",
    "`Atlas`",
    "Atlas…",
    "Atlas...",
  ]) {
    for (const field of ["title", "description"]) {
      const seo = {
        title: "Atlas",
        description: "Draft documents.",
        [field]: value,
      };
      assert.throws(
        () => validateTool({ ...record, editorial: { seo } }),
        /plain|truncated/i,
      );
    }
  }
});

test("editorial SEO rejects unknown fields at both object levels", () => {
  const { sub: _sub, ...record } = metadataTool;
  const seo = { title: "Atlas", description: "Draft documents." };
  assert.throws(
    () =>
      validateTool({ ...record, editorial: { seo, keywords: ["writing"] } }),
    /Unknown editorial field/,
  );
  for (const extra of [
    { keywords: "writing" },
    { titleTemplate: "%s" },
    { keywords: "writing", other: true },
  ]) {
    assert.throws(
      () =>
        validateTool({ ...record, editorial: { seo: { ...seo, ...extra } } }),
      /Unknown SEO field/,
    );
  }
});

test("editorial SEO does not bypass duplicate catalog identity checks", () => {
  const { sub: _sub, ...record } = metadataTool;
  const tool = {
    ...record,
    editorial: { seo: { title: "Atlas", description: "Draft documents." } },
  };
  assert.throws(() => validateCatalog([tool, { ...tool }]), /Duplicate slug/);
  assert.throws(
    () => validateCatalog([tool, { ...tool, slug: "atlas-copy" }]),
    /Duplicate URL/,
  );
});

test("all ten sourced guides have reviewed, complete editorial metadata", () => {
  const titles = {
    cursor: "Cursor: AI Code Editor, Features & Pricing",
    "github-copilot": "GitHub Copilot: AI Coding Assistant, Plans & Features",
    chatgpt: "ChatGPT: AI Assistant, Features & Pricing",
    claude: "Claude: AI Assistant for Writing, Coding & Research",
    midjourney: "Midjourney: AI Image Generator, Features & Pricing",
    ideogram: "Ideogram: AI Image Generator for Text & Design",
    runway: "Runway: AI Video Generator, Features & Pricing",
    notebooklm: "NotebookLM (Gemini Notebook): AI Research Assistant",
    "perplexity-search": "Perplexity: AI Search Engine with Source Citations",
    canva: "Canva: AI Design Tools for Images & Presentations",
  };
  const tools = readContent();
  for (const [slug, title] of Object.entries(titles)) {
    const tool = tools.find((tool) => tool.slug === slug);
    assert.ok(tool?.editorial?.guide, `Missing sourced guide for ${slug}`);
    assert.equal(tool.editorial.seo?.title, title);
    const description = tool.editorial.seo?.description;
    assert.ok(
      description?.startsWith(tool.name),
      `Missing product identity for ${slug}`,
    );
    assert.match(description, /\.$/);
    assert.doesNotMatch(description, /…|\.{3}|<[^>]+>/);
    assert.equal(buildTitle({ ...tool, sub: null }), title);
    assert.equal(deriveMetaDescription({ ...tool, sub: null }), description);
  }
});

test("shared search links preserve a subcategory scope", () => {
  assert.equal(
    parseCatalogQuery(new URLSearchParams("subcategory=ai-chatbot&q=research"))
      .subcategory,
    "ai-chatbot",
  );
});
test("noindex search pages still allow discovery of linked tools", () => {
  assert.deepEqual(
    pageMetadata({ title: "Search", path: "/search", noIndex: true }).robots,
    { index: false, follow: true },
  );
});
test("editorial guide references are checked before publishing", () => {
  const rows = readContent();
  const guide = {
    checkedAt: "2026-10-13",
    features: [{ label: "Feature", text: "A concrete capability." }],
    useCases: [{ label: "Task", text: "A concrete task." }],
    limitations: ["Check outputs."],
    platforms: ["Web"],
    pricingNote: "Check the official plans.",
    pricingUrl: "https://example.com/pricing",
    sources: [{ label: "Official plans", url: "https://example.com/pricing" }],
    alternatives: [{ slug: rows[1].slug, reason: "A different workflow." }],
  };
  assert.doesNotThrow(() =>
    validateCatalog([{ ...rows[0], editorial: { guide } }, ...rows.slice(1)]),
  );
  assert.throws(
    () =>
      validateCatalog([
        {
          ...rows[0],
          editorial: {
            guide: {
              ...guide,
              alternatives: [{ slug: "missing-tool", reason: "No record" }],
            },
          },
        },
        ...rows.slice(1),
      ]),
    /alternative/i,
  );
  assert.throws(
    () =>
      validateCatalog([
        {
          ...rows[0],
          editorial: { guide: { ...guide, checkedAt: "2026-02-31" } },
        },
        ...rows.slice(1),
      ]),
    /date/i,
  );
});

test("browse pagination has canonical URLs and rejects invalid page numbers", async () => {
  const urls = await import("../features/catalog/urls").catch(() => null);
  assert.ok(urls, "Catalog URL policy is required");
  assert.equal(urls.browsePath("/tools", 1), "/tools");
  assert.equal(
    urls.browsePath("/categories/ai-chatbot", 2),
    "/categories/ai-chatbot/page/2",
  );
  for (const page of ["0", "-1", "2junk", "2.5", "01", "9007199254740992"])
    assert.equal(urls.parseBrowsePage(page), null);
  assert.equal(urls.parseBrowsePage("2"), 2);
  assert.equal(
    urls.searchPath(new URLSearchParams("q=research"), {
      subcategory: "ai-chatbot",
    }),
    "/search?q=research&subcategory=ai-chatbot",
  );
});

test("software markup never guesses the platform or a dollar offer", async () => {
  const { toolJsonLd } = await import("../lib/seo/tool-schema");
  const tool = {
    ...readContent()[0],
    sub: null,
    pricing_detail: "Paid from $20 per seat; annual billing",
  };
  const data = toolJsonLd({
    tool,
    categoryName: "Code & Development",
    siteUrl: "https://aiknows.tools",
  });
  assert.equal(data.operatingSystem, undefined);
  assert.equal(data.offers, undefined);
});
test("reviewed descriptions use product facts rather than a site-wide evidence footer", async () => {
  const { deriveMetaDescription } = await import("../features/catalog/seo");
  const description = deriveMetaDescription({
    ...readContent()[0],
    sub: null,
    editorial: {
      seo: {
        title: "Image Editor",
        description:
          "Edit images in the browser with background removal and generative fill.",
      },
    },
  });
  assert.equal(
    description,
    "Edit images in the browser with background removal and generative fill.",
  );
});

test("category guides link to actual taxonomy destinations", async () => {
  const { CATEGORY_GUIDES } = await import(
    "../features/catalog/category-guides"
  );
  const { CATEGORIES, SUBCATEGORIES } = await import(
    "../features/catalog/taxonomy"
  );
  const slugs = new Set([...CATEGORIES, ...SUBCATEGORIES].map((c) => c.slug));
  for (const [slug, guide] of Object.entries(CATEGORY_GUIDES)) {
    assert.ok(slugs.has(slug), `Unknown guide ${slug}`);
    for (const link of guide.related)
      assert.ok(slugs.has(link.slug), `Unknown related category ${link.slug}`);
  }
});
test("related tools prioritize matching tasks instead of arbitrary broad-category rows", async () => {
  const { relatedTools } = await import("../features/catalog/related");
  const base = {
    ...readContent()[0],
    sub: null,
    slug: "source",
    subcategory: "developer-tools",
    tags: ["coding", "ai"],
  };
  const irrelevant = {
    ...base,
    slug: "unrelated",
    subcategory: null,
    tags: ["ai"],
  };
  const match = { ...base, slug: "coding-peer" };
  assert.deepEqual(
    relatedTools([irrelevant, match, base], base).map((t) => t.slug),
    ["coding-peer"],
  );
});

test("legacy pagination redirects remove page queries without losing presentation state", async () => {
  const urls = await import("../features/catalog/urls");
  assert.equal(typeof urls.legacyPaginationPath, "function");
  assert.equal(
    urls.legacyPaginationPath(
      "/tools",
      new URLSearchParams("page=2&view=list"),
    ),
    "/tools/page/2?view=list",
  );
  assert.equal(
    urls.legacyPaginationPath(
      "/categories/ai-chatbot",
      new URLSearchParams("page=1"),
    ),
    "/categories/ai-chatbot",
  );
  assert.equal(
    urls.legacyPaginationPath("/tools", new URLSearchParams("page=invalid")),
    null,
  );
});

test("changing the search category clears an inherited hidden subcategory", async () => {
  const urls = await import("../features/catalog/urls");
  assert.equal(typeof urls.updateSearchParams, "function");
  const initial = new URLSearchParams(
    "q=research&subcategory=ai-chatbot&page=2",
  );
  const changed = urls.updateSearchParams(initial, {
    category: "research-data",
  });
  assert.equal(changed.get("category"), "research-data");
  assert.equal(changed.has("subcategory"), false);
  assert.equal(changed.has("page"), false);
  assert.equal(changed.get("q"), "research");
  assert.equal(initial.get("subcategory"), "ai-chatbot");
});
