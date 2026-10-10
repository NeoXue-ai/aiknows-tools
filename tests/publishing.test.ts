import test from "node:test";
import assert from "node:assert/strict";
import { publishSubmission } from "../scripts/catalog/github";
const prepared = {
  slug: "example",
  content: '{"slug":"example"}\n',
  baseSha: "abc",
};
function gateway(
  options: {
    branch?: boolean;
    file?: boolean;
    pr?: boolean;
    moved?: boolean;
    extra?: boolean;
    failPR?: boolean;
  } = {},
) {
  const state = {
    branch: options.branch ?? false,
    file: options.file ?? false,
    pr: options.pr ?? false,
  };
  const writes: string[] = [];
  const api = async (path: string, method = "GET", body?: any) => {
    if (method !== "GET") writes.push(method + " " + path);
    if (path.startsWith("/pulls?")) return state.pr ? [{ number: 7 }] : [];
    if (path === "/git/ref/heads/main")
      return { object: { sha: options.moved ? "changed" : "abc" } };
    if (path.startsWith("/git/ref/heads/catalog"))
      return state.branch ? { object: { sha: "branch" } } : null;
    if (path === "/git/refs") {
      state.branch = true;
      return {};
    }
    if (path.startsWith("/compare"))
      return {
        files: options.extra
          ? [{ filename: "app/page.tsx" }]
          : state.file
            ? [{ filename: "content/tools/example.json", status: "added" }]
            : [],
      };
    if (path.startsWith("/contents")) {
      if (method === "GET")
        return state.file
          ? { content: Buffer.from(prepared.content).toString("base64") }
          : null;
      state.file = true;
      return {};
    }
    if (path === "/pulls") {
      if (options.failPR) {
        options.failPR = false;
        throw new Error("temporary outage");
      }
      state.pr = true;
      return { number: 7 };
    }
    throw new Error(path);
  };
  return { api, writes, state };
}
test("publishing refuses a changed validated base or unrelated branch files", async () => {
  for (const options of [{ moved: true }, { branch: true, extra: true }]) {
    const fake = gateway(options);
    await assert.rejects(
      () => publishSubmission(fake.api, "owner/repo", "main", 1, prepared),
      /changed|unrelated/,
    );
    assert.equal(fake.writes.length, 0);
  }
});
test("publishing recovers after PR creation fails without duplicating commits", async () => {
  const fake = gateway({ failPR: true });
  await assert.rejects(
    () => publishSubmission(fake.api, "owner/repo", "main", 1, prepared),
    /outage/,
  );
  const result = await publishSubmission(
    fake.api,
    "owner/repo",
    "main",
    1,
    prepared,
  );
  assert.equal(result, 7);
  assert.equal(fake.writes.filter((x) => x === "POST /git/refs").length, 1);
  assert.equal(
    fake.writes.filter((x) => x.startsWith("PUT /contents")).length,
    1,
  );
  assert.equal(
    await publishSubmission(fake.api, "owner/repo", "main", 1, prepared),
    7,
  );
  assert.equal(fake.writes.filter((x) => x === "POST /pulls").length, 2);
});
