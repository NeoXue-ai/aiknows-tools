import ToolsIndexPage, {
  toolDirectoryMetadata,
} from "@/features/catalog/components/tool-directory-page";
export const metadata = toolDirectoryMetadata();
export default function Page() {
  return <ToolsIndexPage />;
}
