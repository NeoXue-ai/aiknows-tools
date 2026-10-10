import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const dist = process.env.NEXT_DIST_DIR || ".next";
const snapshot = JSON.parse(readFileSync(".catalog/catalog.json", "utf8"));
for (const slug of snapshot.tools.map((tool) => tool.slug))
  assert.ok(
    existsSync(join(dist, "server/app/tools", `${slug}.html`)),
    `Missing prerendered tool: ${slug}`,
  );
for (const path of [
  "tools",
  "categories/productivity",
  "categories/ai-writer",
]) {
  const html = readFileSync(join(dist, "server/app", `${path}.html`), "utf8");
  const count = (html.match(/aria-label="Open [^"<>]+ detail page"/g) ?? [])
    .length;
  const scope = path.split("/").at(-1);
  const total =
    path === "tools"
      ? snapshot.tools.length
      : snapshot.tools.filter(
          (tool) =>
            tool.primary_category === scope || tool.subcategory === scope,
        ).length;
  assert.equal(
    count,
    Math.min(24, total),
    `Expected 24 real summary links in static ${path} HTML`,
  );
  assert.ok(
    !/submitter_email|__Host-aiknows_session/.test(html),
    "Private account fields in public HTML",
  );
  assert.ok(
    html.includes(snapshot.indexBase),
    "HTML must reference its own index version",
  );
}
const submit = readFileSync(join(dist, "server/app/submit.html"), "utf8");
assert.ok(
  !submit.includes('href="/login'),
  "Submission must not require site login",
);
console.log(
  `Verified ${snapshot.tools.length} static tool pages, first-page HTML cards, public fields and contribution page.`,
);
