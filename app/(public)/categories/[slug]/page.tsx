import CategoryDetailPage, {
  generateCategoryMetadata,
} from "@/features/catalog/components/category-page";
import { CATEGORIES, SUBCATEGORIES } from "@/features/catalog/taxonomy";
export const dynamicParams = false;
export async function generateStaticParams() {
  return [...CATEGORIES, ...SUBCATEGORIES].map((c) => ({ slug: c.slug }));
}
export const generateMetadata = generateCategoryMetadata;
export default CategoryDetailPage;
