import ToolsIndexPage, {
  toolDirectoryMetadata,
} from "@/features/catalog/components/tool-directory-page";
import { getCatalogPage } from "@/features/catalog/server";
import { parseBrowsePage } from "@/features/catalog/urls";
import { notFound, permanentRedirect } from "next/navigation";
export const dynamicParams = false;
export async function generateStaticParams() {
  const first = await getCatalogPage();
  return Array.from({ length: first.totalPages }, (_, i) => ({
    page: String(i + 1),
  }));
}
type Props = { params: Promise<{ page: string }> };
export async function generateMetadata({ params }: Props) {
  const page = parseBrowsePage((await params).page);
  return page ? toolDirectoryMetadata(page) : { robots: { index: false } };
}
export default async function Page({ params }: Props) {
  const page = parseBrowsePage((await params).page);
  if (!page) notFound();
  if (page === 1) permanentRedirect("/tools");
  return <ToolsIndexPage page={page} />;
}
