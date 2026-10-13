"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ToolToolbar, type ViewMode } from "@/components/tool-toolbar";
import { ToolListView } from "@/components/tool-list-view";
import { ToolEmptyState } from "@/components/tool-empty-state";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolPagination } from "@/components/tool-pagination";
import {
  loadCards,
  loadSearch,
  StaleCatalogError,
} from "@/features/catalog/browser";
import { subBySlug } from "@/features/catalog/taxonomy";
import { parseCatalogQuery, queryTools } from "@/features/catalog/query";
import type { CatalogPage, ToolSummary } from "@/features/catalog/types";
import type { SortKey } from "@/features/catalog/types";
import {
  browsePath,
  searchPath,
  updateSearchParams,
} from "@/features/catalog/urls";
const VIEW_KEY = "aiknows:tool-view";

export function ToolDiscovery({
  initialPage,
  indexBase,
  scope,
  variant = "full",
  basePath = "/tools",
}: {
  initialPage: CatalogPage;
  indexBase: string;
  scope?: { category?: string; subcategory?: string };
  variant?: "full" | "scoped";
  basePath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const isSearchPage = pathname === "/search";
  const query = React.useMemo(
    () => ({
      ...parseCatalogQuery(new URLSearchParams(params.toString())),
      ...(!isSearchPage ? { page: initialPage.page } : {}),
      ...(scope
        ? { category: scope.category, subcategory: scope.subcategory }
        : {}),
    }),
    [params, scope, isSearchPage, initialPage.page],
  );
  const [q, setQ] = React.useState(query.q);
  const [view, setView] = React.useState<ViewMode>("cards");
  const [cards, setCards] = React.useState<ToolSummary[] | null>(null);
  const [search, setSearch] = React.useState<Record<string, string> | null>(
    null,
  );
  const [error, setError] = React.useState<string | null>(null);
  const [stale, setStale] = React.useState(false);
  const [retry, setRetry] = React.useState(0);
  const urlView = params.get("view");
  const urlQ = params.get("q") ?? "";

  React.useEffect(() => setQ(urlQ), [urlQ]);
  React.useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(VIEW_KEY);
    } catch {}
    const next =
      urlView === "list" || urlView === "cards"
        ? urlView
        : stored === "list" || stored === "cards"
          ? stored
          : window.matchMedia("(max-width: 767px)").matches
            ? "list"
            : "cards";
    setView(next);
  }, [urlView]);

  function update(changes: Record<string, string | null>, resetPage = true) {
    const next = updateSearchParams(
      new URLSearchParams(params.toString()),
      changes,
      resetPage,
    );
    const viewOnly = Object.keys(changes).every((key) => key === "view");
    const viewQuery = next.get("view");
    const destination =
      !isSearchPage && viewOnly
        ? `${browsePath(basePath, initialPage.page)}${viewQuery ? `?view=${viewQuery}` : ""}`
        : searchPath(next, scope);
    router.replace(destination, { scroll: false });
  }
  React.useEffect(() => {
    if (q.trim() === query.q) return;
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      next.delete("page");
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      router.replace(searchPath(next, scope), { scroll: false });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [q, query.q, params, router, scope]);

  const defaultScope = scope?.category;
  const isInitial =
    !query.q &&
    query.sort === "time" &&
    query.dir === "desc" &&
    query.page === initialPage.page &&
    query.subcategory === scope?.subcategory &&
    query.category === defaultScope;
  const needsCards = !isInitial && !cards;
  const needsSearch = !!query.q && !search;
  const loading = needsCards || needsSearch;
  React.useEffect(() => {
    if (!loading) {
      setError(null);
      return;
    }
    let active = true;
    setError(null);
    setStale(false);
    Promise.all([
      needsCards ? loadCards(indexBase) : Promise.resolve(cards),
      needsSearch ? loadSearch(indexBase) : Promise.resolve(search),
    ])
      .then(([nextCards, nextSearch]) => {
        if (active) {
          if (nextCards) setCards(nextCards);
          if (nextSearch) setSearch(nextSearch);
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const outdated = error instanceof StaleCatalogError;
          setStale(outdated);
          setError(
            outdated
              ? "This directory has been updated. Reload to continue."
              : "We couldn’t load the tool directory. Please try again.",
          );
        }
      });
    return () => {
      active = false;
    };
  }, [indexBase, loading, needsCards, needsSearch, cards, search, retry]);
  const result = React.useMemo(
    () =>
      !isInitial && cards && (!query.q || search)
        ? queryTools(cards, query, search ?? {})
        : initialPage,
    [isInitial, cards, query, search, initialPage],
  );

  function chooseView(next: ViewMode) {
    setView(next);
    try {
      localStorage.setItem(VIEW_KEY, next);
    } catch {}
    update({ view: next === "cards" ? null : next }, false);
  }
  function chooseSort(sort: SortKey) {
    const dir =
      sort === query.sort
        ? query.dir === "asc"
          ? "desc"
          : "asc"
        : sort === "name"
          ? "asc"
          : "desc";
    update({ sort, dir });
  }
  return (
    <div className="space-y-6" aria-busy={loading && !error}>
      <ToolToolbar
        q={q}
        onQChange={setQ}
        sortKey={query.sort}
        sortDir={query.dir}
        onSortChange={chooseSort}
        onToggleDir={() =>
          update({ dir: query.dir === "asc" ? "desc" : "asc" })
        }
        view={view}
        onViewChange={chooseView}
        count={result.total}
        showExamples={variant !== "scoped"}
        showCategory={variant !== "scoped"}
      />
      {isSearchPage && query.subcategory && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-border bg-secondary px-3 py-1.5">
            Task: {subBySlug(query.subcategory)?.name ?? "Selected task"}
          </span>
          <button
            type="button"
            className="text-accent hover:underline"
            onClick={() => update({ subcategory: null })}
          >
            Clear task filter
          </button>
        </div>
      )}
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-border p-6 text-sm"
        >
          <p>{error}</p>
          <button
            type="button"
            className="mt-3 text-accent underline"
            onClick={() =>
              stale ? window.location.reload() : setRetry((value) => value + 1)
            }
          >
            {stale ? "Reload directory" : "Try again"}
          </button>
        </div>
      ) : loading ? (
        <p
          role="status"
          className="py-10 text-center text-sm text-muted-foreground"
        >
          Loading tools…
        </p>
      ) : result.total === 0 ? (
        <ToolEmptyState onClear={query.q ? () => setQ("") : undefined} />
      ) : view === "cards" ? (
        <ToolGrid tools={result.items} />
      ) : (
        <ToolListView tools={result.items} />
      )}
      {!loading && !error && result.total > 0 && (
        <ToolPagination
          basePath={basePath}
          currentPage={result.page}
          totalPages={result.totalPages}
        />
      )}
    </div>
  );
}
