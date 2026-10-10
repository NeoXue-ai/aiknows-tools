import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { validateCatalog } from "../../features/catalog/validation";
export function readContent(root = process.cwd()) {
  const directory = join(root, "content/tools");
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".json"))
    .sort();
  const records = files.map((file) => {
    const record = JSON.parse(readFileSync(join(directory, file), "utf8"));
    if (file !== `${record.slug}.json`)
      throw new Error(`Filename must match slug: ${file}`);
    return record;
  });
  if (!records.length) throw new Error("Catalog must not be empty");
  return validateCatalog(records);
}
