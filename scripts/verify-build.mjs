import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  getCatalogPage,
  getPublicTools,
  getPublicCategories,
  getPublicSubcategories,
} from "../features/catalog/server.ts";
import { DEFAULT_QUERY } from "../features/catalog/query.ts";
import { browsePath } from "../features/catalog/urls.ts";
import { siteUrl } from "../lib/site.ts";
const dist = process.env.NEXT_DIST_DIR || ".next";
const snapshot = JSON.parse(readFileSync(".catalog/catalog.json", "utf8"));
const tools = await getPublicTools();
const categories = await getPublicCategories();
const subcategories = await getPublicSubcategories();
function html(path) {
  return readFileSync(
    join(dist, "server/app", `${path.slice(1)}.html`),
    "utf8",
  );
}
function unescape(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"');
}
function cardSlugs(source) {
  return [
    ...source.matchAll(/<a\b[^>]*aria-label="Open [^"<>]+ detail page"[^>]*>/g),
  ].map((m) => {
    const href = m[0].match(/href="([^"]+)"/);
    assert.ok(href, "Card link is missing");
    return unescape(href[1]).replace("/tools/", "");
  });
}
for (const tool of tools) {
  const path = `/tools/${tool.slug}`;
  assert.ok(
    existsSync(join(dist, "server/app", `${path.slice(1)}.html`)),
    `Missing static tool ${tool.slug}`,
  );
  if (tool.editorial?.guide) {
    const source = html(path);
    for (const id of [
      "sec-features",
      "sec-use-cases",
      "sec-pricing",
      "sec-limitations",
      "sec-alternatives",
    ])
      assert.ok(source.includes(`id="${id}"`), `Missing ${id} on ${path}`);
    assert.ok(
      source.includes(tool.editorial.guide.checkedAt),
      `Missing check date on ${path}`,
    );
    for (const alt of tool.editorial.guide.alternatives)
      assert.ok(
        source.includes(`href="/tools/${alt.slug}"`),
        `Missing alternative ${alt.slug} on ${path}`,
      );
  }
}
const lists = [
  { base: "/tools", scope: {} },
  ...categories.map((c) => ({
    base: `/categories/${c.slug}`,
    scope: { category: c.slug },
  })),
  ...subcategories
    .filter((c) => c.count > 0)
    .map((c) => ({
      base: `/categories/${c.slug}`,
      scope: { subcategory: c.slug },
    })),
];
let pages = 0;
for (const list of lists) {
  const first = await getCatalogPage({ ...DEFAULT_QUERY, ...list.scope });
  for (let page = 1; page <= first.totalPages; page++) {
    const expected = await getCatalogPage({
      ...DEFAULT_QUERY,
      ...list.scope,
      page,
    });
    const path = browsePath(list.base, page);
    const source = html(path);
    assert.deepEqual(
      cardSlugs(source),
      expected.items.map((t) => t.slug),
      `Wrong page slice in ${path}`,
    );
    assert.ok(
      source.includes(`<link rel="canonical" href="${siteUrl}${path}"`),
      `Wrong canonical in ${path}`,
    );
    if (page < first.totalPages)
      assert.ok(
        source.includes(`href="${browsePath(list.base, page + 1)}"`),
        `Missing next page in ${path}`,
      );
    if (page > 1)
      assert.ok(
        source.includes(`href="${browsePath(list.base, page - 1)}"`),
        `Missing previous page in ${path}`,
      );
    assert.ok(
      !/submitter_email|__Host-aiknows_session|sb_secret_[A-Za-z0-9_-]{10,}/.test(
        source,
      ),
      "Private data in public HTML",
    );
    assert.ok(
      source.includes(snapshot.indexBase),
      `Stale catalog version in ${path}`,
    );
    pages++;
  }
}
for (const path of ["/search", "/blog"])
  assert.ok(
    html(path).includes('<meta name="robots" content="noindex, follow"'),
    `Expected noindex, follow on ${path}`,
  );
const sitemap = readFileSync(join(dist, "server/app/sitemap.xml.body"), "utf8");
assert.ok(!sitemap.includes(`${siteUrl}/blog<`), "Empty blog in sitemap");
assert.ok(!sitemap.includes(`${siteUrl}/search<`), "Search in sitemap");
const toolUrls = [...sitemap.matchAll(/<loc>[^<]+\/tools\/([^<]+)<\/loc>/g)]
  .map((m) => m[1])
  .filter((slug) => !slug.startsWith("page/"));
assert.equal(toolUrls.length, tools.length, "Sitemap tool count mismatch");
assert.deepEqual(
  new Set(toolUrls),
  new Set(tools.map((t) => t.slug)),
  "Sitemap has removed or missing tool URLs",
);
const submit = html("/submit");
assert.ok(!submit.includes('href="/login'), "Submission requires a site login");
console.log(
  `Verified ${tools.length} static tool pages, ${pages} distinct catalog pages, guide sections, pagination, canonical URLs, noindex and sitemap.`,
);
