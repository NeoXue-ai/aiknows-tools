import { CatalogPagination } from "./catalog-pagination";
import { ToolGrid } from "@/components/ToolGrid";
import type { CatalogPage } from "../types";
/** Keep real links and cards in static HTML while URL-dependent controls hydrate. */
export function CatalogFallback({
  page,
  basePath = "/tools",
}: {
  page: CatalogPage;
  basePath?: string;
}) {
  return (
    <div className="space-y-6">
      <div
        aria-hidden
        className="rounded-2xl border border-border bg-card p-1.5"
      >
        <div className="h-12 rounded-xl bg-secondary" />
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">
        {page.total.toLocaleString()} results
      </p>
      <ToolGrid tools={page.items} />
      <CatalogPagination
        page={page.page}
        totalPages={page.totalPages}
        basePath={basePath}
      />
    </div>
  );
}
