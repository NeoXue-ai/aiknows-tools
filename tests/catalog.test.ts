import test from "node:test";
import assert from "node:assert/strict";
import { validateTool, validateCatalog } from "../features/catalog/validation";
import {
  toToolSummary,
  queryTools,
  parseCatalogQuery,
} from "../features/catalog/query";

const tool = {
  slug: "sample",
  name: "Sample",
  url: "https://sample.example",
  primary_category: "productivity",
  subcategory: null,
  tagline: "A useful tool",
  description: "Long private-to-detail body",
  tags: ["automation"],
  logo_url: null,
  screenshot_url: null,
  pricing_detail: null,
  source: null,
  dr: null,
  is_featured: false,
  is_verified: false,
  published_at: null,
};
test("schema rejects unsafe URLs, unknown fields and taxonomy drift", () => {
  assert.deepEqual(validateTool(tool), tool);
  assert.throws(
    () => validateTool({ ...tool, url: "javascript:alert(1)" }),
    /URL/,
  );
  assert.throws(
    () => validateTool({ ...tool, submitter_email: "secret@example.com" }),
    /Unknown field/,
  );
  assert.throws(
    () => validateTool({ ...tool, primary_category: "typo" }),
    /category/,
  );
  assert.throws(
    () => validateTool({ ...tool, subcategory: "ai-writer" }),
    /parent/,
  );
  assert.throws(
    () => validateTool({ ...tool, published_at: "yesterday" }),
    /date/,
  );
});
test("catalog rejects duplicate slugs and canonical website URLs", () => {
  assert.throws(() => validateCatalog([tool, { ...tool }]), /Duplicate slug/);
  assert.throws(
    () =>
      validateCatalog([
        tool,
        {
          ...tool,
          slug: "other",
          url: "https://www.sample.example/?utm_source=test",
        },
      ]),
    /Duplicate URL/,
  );
});
test("summary boundary excludes body, editorial and submission data", () => {
  const summary = toToolSummary({
    ...tool,
    editorial: { faqs: [{ question: "Why?", answer: "Because." }] },
  });
  assert.equal("description" in summary, false);
  assert.equal("editorial" in summary, false);
  assert.equal("submitter_email" in summary, false);
  assert.equal(summary.tagline, tool.tagline);
});
test("query parsing, scope, search and pagination are reproducible", () => {
  const rows = [
    tool,
    {
      ...tool,
      slug: "second",
      name: "Second",
      url: "https://second.example",
      dr: 80,
    },
    {
      ...tool,
      slug: "writer",
      name: "Writer",
      primary_category: "writing-content",
    },
  ].map(toToolSummary);
  const q = parseCatalogQuery(new URLSearchParams("sort=name&page=-2&dir=bad"));
  assert.equal(q.page, 1);
  assert.equal(q.dir, "asc");
  assert.equal(parseCatalogQuery(new URLSearchParams("page=2junk")).page, 1);
  const scoped = queryTools(
    rows,
    { ...q, category: "productivity", page: 99 },
    {},
    1,
  );
  assert.equal(scoped.total, 2);
  assert.equal(scoped.page, 2);
  assert.equal(scoped.items[0].slug, "second");
  const search = queryTools(
    rows,
    { ...q, q: "body" },
    { sample: "Long private-to-detail body" },
  );
  assert.deepEqual(
    search.items.map((x) => x.slug),
    ["sample"],
  );
  const dr = queryTools(rows, { ...q, sort: "dr", dir: "desc" });
  assert.equal(dr.items[0].slug, "second");
  assert.deepEqual(queryTools(rows, { ...q, category: "unknown" }).items, []);
});

test("publication timestamps reject invalid calendars and unspecified timezones", () => {
  assert.throws(
    () => validateTool({ ...tool, published_at: "2026-02-31T00:00:00Z" }),
    /date/,
  );
  assert.throws(
    () => validateTool({ ...tool, published_at: "2026-10-10T08:00:00" }),
    /date/,
  );
  assert.equal(
    validateTool({ ...tool, published_at: "2024-02-29T08:00:00+08:00" })
      .published_at,
    "2024-02-29T08:00:00+08:00",
  );
});
