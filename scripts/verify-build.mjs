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
import { siteUrl, siteName } from "../lib/site.ts";
import { buildTitle, deriveMetaDescription } from "../features/catalog/seo.ts";
import { CATEGORY_GUIDES } from "../features/catalog/category-guides.ts";
import { categoryPageMetadata } from "../features/catalog/category-metadata.ts";
const dist = process.env.NEXT_DIST_DIR || ".next";
const snapshot = JSON.parse(readFileSync(".catalog/catalog.json", "utf8"));
const tools = await getPublicTools();
const categories = await getPublicCategories();
const subcategories = await getPublicSubcategories();
function html(path) {
  return readFileSync(
    join(dist, "server/app", `${path === "/" ? "index" : path.slice(1)}.html`),
    "utf8",
  );
}
function unescape(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) =>
      String.fromCodePoint(
        code[0].toLowerCase() === "x"
          ? parseInt(code.slice(1), 16)
          : Number(code),
      ),
    );
}
function title(source) {
  const matches = [...source.matchAll(/<title>([^<]*)<\/title>/g)];
  assert.equal(matches.length, 1, "Expected exactly one title");
  return unescape(matches[0][1]);
}
function meta(source, key) {
  const tags = [...source.matchAll(/<meta\b[^>]*>/g)].map((match) => match[0]);
  const matches = tags.filter(
    (tag) => tag.includes(`name="${key}"`) || tag.includes(`property="${key}"`),
  );
  assert.equal(matches.length, 1, `Expected exactly one ${key}`);
  const content = matches[0].match(/content="([^"]*)"/);
  assert.ok(content, `Missing ${key} content`);
  return unescape(content[1]);
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
const toolTitles = new Set();
const toolDescriptions = new Set();
for (const tool of tools) {
  const path = `/tools/${tool.slug}`;
  assert.ok(
    existsSync(join(dist, "server/app", `${path.slice(1)}.html`)),
    `Missing static tool ${tool.slug}`,
  );
  const source = html(path);
  const expectedTitle = buildTitle(tool);
  const expectedDescription = deriveMetaDescription(tool);
  assert.equal(
    title(source),
    `${expectedTitle} | ${siteName}`,
    `Wrong title in ${path}`,
  );
  assert.ok(expectedTitle.trim(), `Empty title in ${path}`);
  assert.ok(expectedDescription.trim(), `Empty description in ${path}`);
  assert.ok(!/[.…]{3}|…/.test(expectedTitle), `Truncated title in ${path}`);
  assert.ok(!toolTitles.has(expectedTitle), `Duplicate title in ${path}`);
  assert.ok(
    !toolDescriptions.has(expectedDescription),
    `Duplicate description in ${path}`,
  );
  toolTitles.add(expectedTitle);
  toolDescriptions.add(expectedDescription);
  for (const key of ["description", "og:description", "twitter:description"])
    assert.equal(
      meta(source, key),
      expectedDescription,
      `Wrong ${key} in ${path}`,
    );
  for (const key of ["og:title", "twitter:title"])
    assert.equal(meta(source, key), expectedTitle, `Wrong ${key} in ${path}`);
  const structuredBlocks = [
    ...source.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
  const software = structuredBlocks.find(
    (block) => block["@type"] === "SoftwareApplication",
  );
  assert.ok(software, `Missing software metadata in ${path}`);
  assert.equal(
    software.description,
    expectedDescription,
    `Inconsistent software description in ${path}`,
  );
  assert.ok(
    source.includes(`<link rel="canonical" href="${siteUrl}${path}"`),
    `Wrong canonical in ${path}`,
  );
  if (tool.editorial?.seo) {
    assert.equal(
      expectedTitle,
      tool.editorial.seo.title,
      `Ignored editorial title in ${path}`,
    );
    assert.equal(
      expectedDescription,
      tool.editorial.seo.description,
      `Ignored editorial description in ${path}`,
    );
  }
  if (tool.editorial?.externalLinks?.length) {
    const resources = source.match(
      /<section\b[^>]*id="sec-resources"[^>]*>([\s\S]*?)<\/section>/,
    );
    assert.ok(resources, `Missing source section in ${path}`);
    for (const link of tool.editorial.externalLinks)
      assert.ok(
        unescape(resources[1]).includes(`href="${link.url}"`),
        `Missing source link ${link.url} in ${path}`,
      );
  }
  if (tool.editorial?.guide) {
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
for (const path of [
  "/",
  "/tools",
  "/categories",
  "/collections",
  "/about",
  "/faq",
  "/submit",
  "/contact",
  "/pricing",
  "/search",
  "/blog",
  "/latest",
]) {
  const source = html(path);
  assert.ok(
    title(source).endsWith(` | ${siteName}`),
    `Inconsistent branding in ${path}`,
  );
  const description = meta(source, "description");
  assert.ok(description.trim(), `Empty public-page description in ${path}`);
  for (const key of ["og:description", "twitter:description"])
    assert.equal(
      meta(source, key),
      description,
      `Inconsistent ${key} in ${path}`,
    );
  assert.ok(
    !description.includes("evidence-led"),
    `Obsolete public description in ${path}`,
  );
}
const emptyCategorySlugs = subcategories
  .filter((category) => category.count === 0)
  .map((category) => category.slug);
const categoryTitles = new Set();
const categoryDescriptions = new Set();
for (const category of [...categories, ...subcategories]) {
  const path = `/categories/${category.slug}`;
  const guide = CATEGORY_GUIDES[category.slug];
  assert.ok(guide, `Missing category guide ${category.slug}`);
  const count = tools.filter(
    (tool) =>
      tool.primary_category === category.slug ||
      tool.subcategory === category.slug,
  ).length;
  const source = html(path);
  const expected = categoryPageMetadata({
    slug: category.slug,
    name: category.name,
    count,
    isCategory: categories.some((item) => item.slug === category.slug),
  });
  assert.equal(
    title(source),
    `${expected.title} | ${siteName}`,
    `Wrong category title on ${path}`,
  );
  assert.equal(
    meta(source, "description"),
    expected.description,
    `Wrong category description on ${path}`,
  );
  for (const key of ["og:description", "twitter:description"])
    assert.equal(
      meta(source, key),
      expected.description,
      `Wrong social description on ${path}`,
    );
  assert.ok(
    !categoryTitles.has(title(source)),
    `Repeated category title on ${path}`,
  );
  assert.ok(
    !categoryDescriptions.has(expected.description),
    `Repeated category description on ${path}`,
  );
  categoryTitles.add(title(source));
  categoryDescriptions.add(expected.description);
  assert.ok(
    source.includes(`data-category-guide="${category.slug}"`),
    `Missing authored landing page on ${path}`,
  );
  const article = unescape(
    source.match(
      /<section\b[^>]*id="category-guide"[^>]*>([\s\S]*?)<\/section>/,
    )?.[1] ?? "",
  );
  for (const text of [
    guide.introduction,
    ...guide.capabilities,
    ...guide.workflow,
    ...guide.audiences.map((item) => item.text),
    ...guide.criteria.map((item) => item.text),
    ...guide.faqs.flatMap((item) => [item.question, item.answer]),
  ])
    assert.ok(
      article.includes(text),
      `Missing visible category content on ${path}`,
    );
  assert.ok(
    source.includes(`<link rel="canonical" href="${siteUrl}${path}"`),
    `Wrong category canonical on ${path}`,
  );
  const visibleRelated = guide.related.filter(
    (link) => !emptyCategorySlugs.includes(link.slug),
  );
  if (count > 0)
    assert.ok(
      visibleRelated.length >= 3,
      `Sparse related category navigation on ${path}`,
    );
  for (const link of visibleRelated)
    assert.ok(
      article.includes(`href="/categories/${link.slug}"`),
      `Missing authored related link ${link.slug} on ${path}`,
    );

  for (const emptySlug of emptyCategorySlugs)
    assert.ok(
      !source.includes(`href="/categories/${emptySlug}"`),
      `Empty category link ${emptySlug} on ${path}`,
    );
  assert.equal(
    meta(source, "robots"),
    count > 0 ? "index, follow" : "noindex, follow",
    `Wrong category index policy on ${path}`,
  );
  const blocks = [
    ...source.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map((match) => JSON.parse(match[1]));
  const collection = blocks.find(
    (block) => block["@type"] === "CollectionPage",
  );
  assert.ok(collection, `Missing collection schema on ${path}`);
  assert.equal(collection.url, `${siteUrl}${path}`);
  assert.equal(collection.description, expected.description);
  assert.equal(collection.mainEntity["@type"], "ItemList");
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
    if (list.base.startsWith("/categories/") && page > 1)
      assert.ok(
        !source.includes('id="category-guide"'),
        `Repeated category article on ${path}`,
      );
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
for (const category of [...categories, ...subcategories]) {
  const count = tools.filter(
    (tool) =>
      tool.primary_category === category.slug ||
      tool.subcategory === category.slug,
  ).length;
  assert.equal(
    sitemap.includes(`<loc>${siteUrl}/categories/${category.slug}</loc>`),
    count > 0,
    `Wrong category sitemap membership ${category.slug}`,
  );
}
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
  `Verified ${tools.length} unique tool titles and descriptions, matching social metadata, public-page metadata, ${pages} distinct catalog pages, guide sections, pagination, canonical URLs, noindex and sitemap.`,
);
