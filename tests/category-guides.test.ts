import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_GUIDES } from "../features/catalog/category-guides";
import { CATEGORIES, SUBCATEGORIES } from "../features/catalog/taxonomy";
import { categoryPageMetadata } from "../features/catalog/category-metadata";

const taxonomy = [...CATEGORIES, ...SUBCATEGORIES];
const slugs = new Set(taxonomy.map((item) => item.slug));

test("every taxonomy destination has an authored category landing page", () => {
  assert.deepEqual(new Set(Object.keys(CATEGORY_GUIDES)), slugs);
});

test("category guides explain the task and offer valid neighboring destinations", () => {
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  const introductions = new Set<string>();
  for (const item of taxonomy) {
    const guide = CATEGORY_GUIDES[item.slug];
    assert.ok(guide, `Missing ${item.slug}`);
    const rich = guide as typeof guide & {
      capabilities: string[];
      audiences: { label: string; text: string }[];
      workflow: string[];
    };
    assert.ok(
      rich.capabilities?.length >= 4,
      `Missing capabilities: ${item.slug}`,
    );
    assert.ok(rich.audiences?.length >= 2, `Missing audiences: ${item.slug}`);
    assert.ok(rich.workflow?.length >= 3, `Missing workflow: ${item.slug}`);
    assert.ok(guide.criteria.length >= 3, `Missing criteria: ${item.slug}`);
    assert.ok(guide.faqs.length >= 5, `Thin FAQs: ${item.slug}`);
    assert.ok(guide.related.length >= 3, `Missing neighbors: ${item.slug}`);
    assert.equal(
      new Set(guide.related.map((link) => link.slug)).size,
      guide.related.length,
    );
    for (const link of guide.related) {
      assert.ok(slugs.has(link.slug), `Unknown destination: ${link.slug}`);
      assert.notEqual(link.slug, item.slug);
    }
    for (const faq of guide.faqs)
      assert.ok(faq.answer.trim().split(/\s+/).length >= 15);
    assert.ok(!titles.has(guide.title), `Duplicate title: ${item.slug}`);
    assert.ok(
      !descriptions.has(guide.description),
      `Duplicate description: ${item.slug}`,
    );
    const normalized = guide.introduction
      .toLowerCase()
      .replaceAll(item.name.toLowerCase(), "<category>");
    assert.ok(
      !introductions.has(normalized),
      `Repeated introduction: ${item.slug}`,
    );
    titles.add(guide.title);
    descriptions.add(guide.description);
    introductions.add(normalized);
    const metadata = categoryPageMetadata({
      slug: item.slug,
      name: item.name,
      count: 1,
      isCategory: CATEGORIES.some((c) => c.slug === item.slug),
    });
    assert.equal(metadata.title, guide.title);
    assert.equal(metadata.description, guide.description);
    assert.equal(
      categoryPageMetadata({
        slug: item.slug,
        name: item.name,
        count: 0,
        isCategory: false,
      }).robots &&
        (
          categoryPageMetadata({
            slug: item.slug,
            name: item.name,
            count: 0,
            isCategory: false,
          }).robots as { index: boolean }
        ).index,
      false,
    );
  }
});

test("category collection schema identifies the current paginated list", async () => {
  const policy = await import("../features/catalog/category-metadata");
  assert.ok(
    "categoryCollectionJsonLd" in policy,
    "Category schema must describe the collection page",
  );
  const makeSchema = (
    policy as unknown as {
      categoryCollectionJsonLd: (input: {
        slug: string;
        name: string;
        description: string;
        page: number;
        siteUrl: string;
        itemList: object;
      }) => { url: string; mainEntity: object; description: string };
    }
  ).categoryCollectionJsonLd;
  const list = { "@type": "ItemList", numberOfItems: 2, itemListElement: [] };
  const result = makeSchema({
    slug: "ai-summarizer",
    name: "AI Summarizer",
    description: "Compare document summarization workflows.",
    page: 2,
    siteUrl: "https://aiknows.tools",
    itemList: list,
  });
  assert.equal(
    result.url,
    "https://aiknows.tools/categories/ai-summarizer/page/2",
  );
  assert.deepEqual(result.mainEntity, list);
  assert.equal(result.description, "Compare document summarization workflows.");
});

test("populated category guides retain three useful links after empty destinations are hidden", async () => {
  const { readContent } = await import("../scripts/catalog/source");
  const populated = new Set(
    readContent().flatMap((tool) => [
      tool.primary_category,
      ...(tool.subcategory ? [tool.subcategory] : []),
    ]),
  );
  for (const slug of populated) {
    const guide = CATEGORY_GUIDES[slug];
    assert.ok(guide, `Missing guide ${slug}`);
    assert.ok(
      guide.related.filter((link) => populated.has(link.slug)).length >= 3,
      `Too few populated destinations from ${slug}`,
    );
  }
});
