import { pageMetadata } from "../../lib/seo/metadata";
import { CATEGORY_GUIDES } from "./category-guides";
import { browsePath } from "./urls";

export function categoryPageMetadata({
  slug,
  name,
  count,
  isCategory,
  page = 1,
}: {
  slug: string;
  name: string;
  count: number;
  isCategory: boolean;
  page?: number;
}) {
  const guide = page === 1 ? CATEGORY_GUIDES[slug] : undefined;
  const title =
    page > 1
      ? `${name} — Page ${page}`
      : (guide?.title ?? (isCategory ? `AI Tools for ${name}` : name));
  const description =
    page > 1
      ? `Browse page ${page} of ${name} on AIKnows. Explore more tools, compare product descriptions and pricing options, and visit official websites.`
      : (guide?.description ??
        `Browse ${count.toLocaleString("en")} tools in ${name}. Compare product descriptions, pricing options and official websites in the AIKnows directory.`);
  return pageMetadata({
    title,
    description,
    path: browsePath(`/categories/${slug}`, page),
    noIndex: count === 0,
  });
}
