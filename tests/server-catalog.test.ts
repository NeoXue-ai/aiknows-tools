import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getCatalogPage,
  getPublicTools,
  getCatalogVersion,
} from "../features/catalog/server";
import {
  queryTools,
  toToolSummary,
  DEFAULT_QUERY,
} from "../features/catalog/query";

test("server and browser indexes return the same scoped search and order", async () => {
  const search = JSON.parse(
    readFileSync(`public${getCatalogVersion()}/search.json`, "utf8"),
  );
  const tools = await getPublicTools();
  const query = {
    ...DEFAULT_QUERY,
    q: "automation",
    category: "productivity",
    sort: "name" as const,
    page: 2,
  };
  const expected = queryTools(tools.map(toToolSummary), query, search);
  assert.ok(expected.total > 24);
  assert.deepEqual(await getCatalogPage(query), expected);
});
