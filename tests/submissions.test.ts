import test from "node:test";
import assert from "node:assert/strict";
import { toolFromIssue } from "../features/submissions/issue";
const body = `### Tool name\n\nExample\n\n### Slug\n\nexample\n\n### Website\n\nhttps://example.com\n\n### Short description\n\nA useful writing tool.\n\n### Full description\n\nWrite drafts and edit them.\n\n### Primary category\n\nwriting-content\n\n### Subcategory\n\nai-writer\n\n### Tags\n\nwriting, drafts`;
test("issue input produces a validated public record with unknown dates", () => {
  const record = toolFromIssue(body, []);
  assert.equal(record.slug, "example");
  assert.equal(record.published_at, null);
  assert.deepEqual(record.tags, ["writing", "drafts"]);
  assert.equal(record.is_verified, false);
});
test("malformed, duplicate and unsafe issue input is rejected", () => {
  assert.throws(
    () =>
      toolFromIssue(
        body.replace("https://example.com", "javascript:alert(1)"),
        [],
      ),
    /URL/,
  );
  const record = toolFromIssue(body, []);
  assert.throws(() => toolFromIssue(body, [record]), /Duplicate slug/);
  assert.throws(
    () =>
      toolFromIssue(
        body.replace("example\n\n### Website", "another\n\n### Website"),
        [record],
      ),
    /Duplicate URL/,
  );
  assert.throws(
    () =>
      toolFromIssue(
        body.replace("### Primary category", "### Wrong field"),
        [],
      ),
    /category/,
  );
  assert.throws(
    () => toolFromIssue(body + "\n\n### Website\n\nhttps://evil.example", []),
    /Duplicate issue field/,
  );
});
