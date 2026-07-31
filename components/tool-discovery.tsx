"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToolSearchBar } from "@/components/tool-search-bar";
import { ToolFilters } from "@/components/tool-filters";
import { ToolViewSwitcher, type ViewMode } from "@/components/tool-view-switcher";
import { ToolListView } from "@/components/tool-list-view";
import { ToolEmptyState } from "@/components/tool-empty-state";
import { ToolGrid } from "@/components/ToolGrid";
import { ToolPagination } from "@/components/tool-pagination";
import {
  filterTools,
  TASKS,
  PRICING_OPTIONS,
  USER_TYPES,
  type Task,
  type PricingOption,
  type UserTypeFilter,
  type SortKey,
  type SortDir,
} from "@/lib/tool-score";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/supabase/types";

const VIEW_KEY = "aiknows:tool-view";
const PAGE_SIZE = 24;

function isTask(v: string | null): v is Task {
  return !!v && (TASKS as readonly string[]).includes(v);
}
function isPricing(v: string | null): v is PricingOption {
  return !!v && (PRICING_OPTIONS as readonly string[]).includes(v);
}
function isUserType(v: string | null): v is UserTypeFilter {
  return !!v && (USER_TYPES as readonly string[]).includes(v);
}
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
  initialTask = null,
  initialPricing = null,
  initialUserType = null,
}: {
  tools: Tool[];
  initialQ?: string;
  initialTask?: Task | null;
  initialPricing?: PricingOption | null;
  initialUserType?: UserTypeFilter | null;
}) {
  const router = useRouter();
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

  // ---- Filters (URL ↔ state) ----
  const [task, setTask] = React.useState<Task | null>(initialTask);
  const [pricing, setPricing] = React.useState<PricingOption | null>(initialPricing);
  const [userType, setUserType] = React.useState<UserTypeFilter | null>(initialUserType);

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

  // Reset page when filters/sort/search change.
  React.useEffect(() => {
    setPage(1);
  }, [q, task, pricing, userType, sortKey, sortDir]);

  // ---- URL sync (no scroll, no history bloat) ----
  React.useEffect(() => {
    const params = new URLSearchParams();
    for (const [key, value] of searchParams.entries()) {
      if (
        key === "q" ||
        key === "task" ||
        key === "pricing" ||
        key === "userType" ||
        key === "sort" ||
        key === "dir" ||
        key === "view" ||
        key === "page"
      ) continue;
      params.set(key, value);
    }
    if (q) params.set("q", q);
    if (task) params.set("task", task);
    if (pricing) params.set("pricing", pricing);
    if (userType) params.set("userType", userType);
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
  }, [q, task, pricing, userType, sortKey, sortDir, view, page]);

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
    () => filterTools(tools, { q, task, pricing, userType, sort: sortKey, dir: sortDir }),
    [tools, q, task, pricing, userType, sortKey, sortDir],
  );

  // ---- Pagination ----
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageEnd = pageStart + PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageEnd);

  function clearAll() {
    setQ("");
    setTask(null);
    setPricing(null);
    setUserType(null);
  }

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

  const anyFilter = !!(q || task || pricing || userType);

  return (
    <div className="space-y-6">
      <ToolSearchBar value={q} onChange={setQ} />

      <ToolFilters
        task={task}
        pricing={pricing}
        userType={userType}
        onTaskChange={setTask}
        onPricingChange={setPricing}
        onUserTypeChange={setUserType}
        onClear={clearAll}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">
            {filtered.length === 0 ? 0 : pageStart + 1}–{Math.min(pageEnd, filtered.length)}
          </span>{" "}
          of <span className="font-medium text-foreground">{filtered.length}</span>{" "}
          tools
        </p>
        <div className="flex items-center gap-2">
          <SortMenu
            sortKey={sortKey}
            sortDir={sortDir}
            onChange={setSort}
            onToggleDir={toggleDir}
          />
          <ToolViewSwitcher value={view} onChange={setView} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <ToolEmptyState onClear={anyFilter ? clearAll : undefined} hasFilters={anyFilter} />
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

function SortMenu({
  sortKey,
  sortDir,
  onChange,
  onToggleDir,
}: {
  sortKey: SortKey;
  sortDir: SortDir;
  onChange: (k: SortKey) => void;
  onToggleDir: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label =
    sortKey === "time"
      ? "Time (newest)"
      : sortKey === "name"
        ? "Name (A–Z)"
        : "DR (high → low)";

  return (
    <div ref={ref} className="relative">
      <div className="inline-flex items-center rounded-lg border border-border bg-card/60">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Sort: <span className="text-foreground">{label}</span>
        </button>
        <button
          type="button"
          onClick={onToggleDir}
          aria-label={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
          title={sortDir === "asc" ? "Sort descending" : "Sort ascending"}
          className="inline-flex items-center border-l border-border px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {sortDir === "asc" ? "↑" : "↓"}
        </button>
      </div>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg">
          {(
            [
              { key: "time" as const, label: "Time (newest)" },
              { key: "name" as const, label: "Name (A–Z)" },
              { key: "dr" as const, label: "DR (high → low)" },
            ]
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-secondary",
                sortKey === opt.key ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}