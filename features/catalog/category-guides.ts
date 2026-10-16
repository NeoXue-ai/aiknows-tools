import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { CATEGORIES, SUBCATEGORIES } from "./taxonomy";
import type { CategoryGuide } from "./category-guide-types";

export type { CategoryGuide } from "./category-guide-types";

const directory = join(process.cwd(), "content/category-guides");
const knownSlugs = new Set(
  [...CATEGORIES, ...SUBCATEGORIES].map((item) => item.slug),
);
const fields = new Set([
  "title",
  "description",
  "introduction",
  "capabilities",
  "audiences",
  "criteria",
  "workflow",
  "faqs",
  "related",
]);

function isText(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    !/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  );
}

function readGuide(slug: string): CategoryGuide {
  const value = JSON.parse(
    readFileSync(join(directory, `${slug}.json`), "utf8"),
  );
  const fail = (field: string): never => {
    throw new Error(`Invalid category guide ${slug}: ${field}`);
  };
  if (!knownSlugs.has(slug)) fail("unknown taxonomy slug");
  if (!value || typeof value !== "object" || Array.isArray(value))
    fail("expected object");
  if (Object.keys(value).some((key) => !fields.has(key))) fail("unknown field");
  for (const key of ["title", "description", "introduction"])
    if (!isText(value[key])) fail(key);
  for (const [key, minimum] of [
    ["capabilities", 4],
    ["workflow", 3],
  ] as const) {
    if (
      !Array.isArray(value[key]) ||
      value[key].length < minimum ||
      !value[key].every(isText)
    )
      fail(key);
  }
  for (const [key, minimum, keys] of [
    ["audiences", 2, ["label", "text"]],
    ["criteria", 3, ["label", "text"]],
    ["faqs", 5, ["question", "answer"]],
    ["related", 3, ["slug", "label"]],
  ] as const) {
    if (!Array.isArray(value[key]) || value[key].length < minimum) fail(key);
    for (const item of value[key]) {
      if (
        !item ||
        typeof item !== "object" ||
        Array.isArray(item) ||
        Object.keys(item).length !== keys.length ||
        !keys.every((field) => isText(item[field]))
      )
        fail(key);
    }
  }
  if (
    new Set(value.related.map((item: { slug: string }) => item.slug)).size !==
    value.related.length
  )
    fail("duplicate related categories");
  for (const item of value.related)
    if (!knownSlugs.has(item.slug) || item.slug === slug)
      fail("related destination");
  if (
    new Set(
      value.faqs.map((item: { question: string }) =>
        item.question.toLowerCase(),
      ),
    ).size !== value.faqs.length
  )
    fail("duplicate FAQ questions");
  return value as CategoryGuide;
}

export const CATEGORY_GUIDES: Record<string, CategoryGuide> =
  Object.fromEntries(
    readdirSync(directory)
      .filter((name) => name.endsWith(".json"))
      .sort()
      .map((name) => {
        const slug = name.slice(0, -5);
        return [slug, readGuide(slug)];
      }),
  );
