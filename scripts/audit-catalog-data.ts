import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

type ToolRecord = {
  slug: string;
  primary_category?: string | null;
  pricing_detail?: string | null;
  tagline?: string | null;
  description?: string | null;
  source?: string | null;
  is_featured?: boolean;
  is_verified?: boolean;
};

type DirectoryRecord = {
  slug: string;
  dr?: number | null;
  submission_type?: string | null;
  link_type?: string | null;
  listing_speed?: string | null;
  niche_focus?: string | null;
  submit_url?: string | null;
  paid_price?: string | null;
  last_checked?: string | null;
  last_verified?: string | null;
};

function nonEmpty(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function countBy<T>(records: T[], select: (record: T) => string | null | undefined) {
  return Object.fromEntries(
    records.reduce((counts, record) => {
      const key = select(record) ?? "not-recorded";
      counts.set(key, (counts.get(key) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  );
}

async function loadJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(resolve(process.cwd(), path), "utf8")) as T;
}

async function main() {
  const toolsRaw = await loadJson<{ tools?: ToolRecord[] } | ToolRecord[]>("data/tools.json");
  const tools = Array.isArray(toolsRaw) ? toolsRaw : toolsRaw.tools ?? [];
  const directories = await loadJson<DirectoryRecord[]>("data/directories.json");

  console.log(JSON.stringify({
    tools: {
      total: tools.length,
      primaryCategory: tools.filter((tool) => nonEmpty(tool.primary_category)).length,
      tagline: tools.filter((tool) => nonEmpty(tool.tagline)).length,
      description: tools.filter((tool) => nonEmpty(tool.description)).length,
      pricingDetail: tools.filter((tool) => nonEmpty(tool.pricing_detail)).length,
      source: tools.filter((tool) => nonEmpty(tool.source)).length,
      featured: tools.filter((tool) => tool.is_featured).length,
      verified: tools.filter((tool) => tool.is_verified).length,
    },
    directories: {
      total: directories.length,
      dr: directories.filter((directory) => typeof directory.dr === "number").length,
      submissionType: directories.filter((directory) => nonEmpty(directory.submission_type)).length,
      linkType: directories.filter((directory) => nonEmpty(directory.link_type)).length,
      listingSpeed: directories.filter((directory) => nonEmpty(directory.listing_speed)).length,
      nicheFocus: directories.filter((directory) => nonEmpty(directory.niche_focus)).length,
      submitUrl: directories.filter((directory) => nonEmpty(directory.submit_url)).length,
      paidPrice: directories.filter((directory) => nonEmpty(directory.paid_price)).length,
      lastChecked: directories.filter((directory) => nonEmpty(directory.last_checked)).length,
      lastVerified: directories.filter((directory) => nonEmpty(directory.last_verified)).length,
      submissionTypes: countBy(directories, (directory) => directory.submission_type),
      linkTypes: countBy(directories, (directory) => directory.link_type),
    },
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
