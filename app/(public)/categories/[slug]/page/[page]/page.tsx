import CategoryDetailPage, {
  generateCategoryMetadata,
} from "@/features/catalog/components/category-page";
import { CATEGORIES, SUBCATEGORIES } from "@/features/catalog/taxonomy";
import { getCatalogPage } from "@/features/catalog/server";
import { DEFAULT_QUERY } from "@/features/catalog/query";
import { parseBrowsePage } from "@/features/catalog/urls";
import { notFound, permanentRedirect } from "next/navigation";
export const dynamicParams = false;
export async function generateStaticParams() {
  const pages: { slug: string; page: string }[] = [];
  for (const group of [...CATEGORIES, ...SUBCATEGORIES]) {
    const scope = CATEGORIES.some((c) => c.slug === group.slug)
      ? { category: group.slug }
      : { subcategory: group.slug };
    const first = await getCatalogPage({ ...DEFAULT_QUERY, ...scope });
    for (let p = 1; p <= first.totalPages; p++)
      pages.push({ slug: group.slug, page: String(p) });
  }
  return pages;
}
type Props = { params: Promise<{ slug: string; page: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug, page: raw } = await params;
  const page = parseBrowsePage(raw);
  return page
    ? generateCategoryMetadata({ params: Promise.resolve({ slug }), page })
    : { robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const { slug, page: raw } = await params;
  const page = parseBrowsePage(raw);
  if (!page) notFound();
  if (page === 1) permanentRedirect(`/categories/${slug}`);
  return <CategoryDetailPage params={Promise.resolve({ slug })} page={page} />;
}
