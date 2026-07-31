"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToolToolbar, type ViewMode } from "@/components/tool-toolbar";
import { ToolListView } from "@/components/tool-list-view";
import { ToolEmptyState } from "@/components/tool-empty-state";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolPagination } from "@/components/tool-pagination";
import { filterTools, type SortKey, type SortDir } from "@/lib/tool-score";
import type { Tool } from "@/lib/supabase/types";

const VIEW_KEY = "aiknows:tool-view";
const PAGE_SIZE = 24;

function isSortKey(v: string | null): v is SortKey {
  return v === "time" || v === "name" || v === "dr";
}
function parsePage(v: string | null): number {
  if (!v) return 1;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function ToolDiscovery({
  tools,
  initialQ = "",
  variant = "full",
}: {
  tools: Tool[];
  initialQ?: string;
  variant?: "full" | "scoped";
}) {
  const router = useRouter();
  const scoped = variant === "scoped";
  const searchParams = useSearchParams();

  // ---- View (URL > localStorage > responsive default) ----
  const [view, setView] = React.useState<ViewMode>("cards");
  const [viewHydrated, setViewHydrated] = React.useState(false);
  React.useEffect(() => {
    const fromUrl = searchParams.get("view");
    if (fromUrl === "cards" || fromUrl === "list") {
      setView(fromUrl);
    } else {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(VIEW_KEY);
      } catch {
        /* localStorage may be blocked */
      }
      if (stored === "cards" || stored === "list") {
        setView(stored);
      } else if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
        setView("list");
      } else {
        setView("cards");
      }
    }
    setViewHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Search query (URL ↔ state) ----
  const [q, setQ] = React.useState(initialQ);

  // ---- Sort (URL ↔ state) ----
  const initialSort = searchParams.get("sort");
  const initialDir = (searchParams.get("dir") as SortDir | null) ?? "desc";
  const [sortKey, setSortKey] = React.useState<SortKey>(
    isSortKey(initialSort) ? initialSort : "time",
  );
  const [sortDir, setSortDir] = React.useState<SortDir>(
    initialDir === "asc" ? "asc" : "desc",
  );

  // ---- Page (URL ↔ state) ----
  const [page, setPage] = React.useState<number>(parsePage(searchParams.get("page")));

  // Reset page when search/sort changes — skip first mount so deep links to ?page=N survive.
  const skipFirstPageResetRef = React.useRef(true);
  React.useEffect(() => {
    if (skipFirstPageResetRef.current) {
      skipFirstPageResetRef.current = false;
      return;
    }
    setPage(1);
  }, [q, sortKey, sortDir]);

  // ---- URL sync (no scroll, no history bloat) ----
  React.useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (
        key === "q" ||
        key === "sort" ||
        key === "dir" ||
        key === "view" ||
        key === "page"
      )
        continue;
      params.set(key, value);
    }
    if (q) params.set("q", q);
    if (sortKey !== "time") params.set("sort", sortKey);
    if (sortKey === "time" && sortDir !== "desc") params.set("dir", sortDir);
    if (sortKey === "name" && sortDir !== "asc") params.set("dir", sortDir);
    if (sortKey === "dr" && sortDir !== "desc") params.set("dir", sortDir);
    if (view !== "cards") params.set("view", view);
    if (page > 1) params.set("page", String(page));
    const next = params.toString();
    const current = searchParams.toString();
    if (next === current) return;
    router.replace(`?${next}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, sortKey, sortDir, view, page]);

  // ---- Persist view to localStorage ----
  React.useEffect(() => {
    if (!viewHydrated) return;
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {
      /* ignore */
    }
  }, [view, viewHydrated]);

  // ---- Derived: filtered + sorted tools ----
  const filtered = React.useMemo(
    () => filterTools(tools, { q, sort: sortKey, dir: sortDir }),
    [tools, q, sortKey, sortDir],
  );

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageEnd);

  function setSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
  }

  function toggleDir() {
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  }

  const hasSearch = !!q;

  return (
    <div className="space-y-6">
      <ToolToolbar
        q={q}
        onQChange={setQ}
        sortKey={sortKey}
        sortDir={sortDir}
        onSortChange={setSort}
        onToggleDir={toggleDir}
        view={view}
        onViewChange={setView}
        count={filtered.length}
        showExamples={!scoped}
        showCategory={!scoped}
      />

      {filtered.length === 0 ? (
        <ToolEmptyState onClear={hasSearch ? () => setQ("") : undefined} />
      ) : view === "cards" ? (
        <ToolGrid tools={paged} />
      ) : (
        <ToolListView tools={paged} />
      )}

      {filtered.length > 0 && (
        <ToolPagination
          currentPage={safePage}
          totalPages={totalPages}
          onChange={(n) => {
            setPage(n);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        />
      )}
    </div>
  );
}