import test from "node:test";
import assert from "node:assert/strict";
import { parseCatalogQuery } from "../features/catalog/query";
import { pageMetadata } from "../lib/seo/metadata";
import { validateCatalog } from "../features/catalog/validation";
import { readContent } from "../scripts/catalog/source";

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
test("tool descriptions use product facts rather than a site-wide evidence footer", async () => {
  const { deriveMetaDescription } = await import("../features/catalog/seo");
  const description = deriveMetaDescription({
    ...readContent()[0],
    sub: null,
    tagline:
      "Edit images in the browser with background removal and generative fill.",
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
