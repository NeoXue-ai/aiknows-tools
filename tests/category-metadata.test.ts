import test from "node:test";
import assert from "node:assert/strict";
import { CATEGORY_GUIDES } from "../features/catalog/category-guides";

test("category pagination describes its tool list rather than the first-page guide", async () => {
  const policy = await import("../features/catalog/category-metadata").catch(
    () => null,
  );
  assert.ok(
    policy,
    "Category metadata policy must be independent of rendering",
  );
  const scope = {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    count: 100,
    isCategory: false,
  };
  const first = policy.categoryPageMetadata(scope);
  const second = policy.categoryPageMetadata({ ...scope, page: 2 });
  assert.equal(first.title, CATEGORY_GUIDES["ai-image-generator"].title);
  assert.equal(second.title, "AI Image Generator — Page 2");
  assert.match(second.description as string, /page 2/i);
  assert.notEqual(first.description, second.description);
});
