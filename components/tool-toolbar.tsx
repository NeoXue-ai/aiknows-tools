"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  Shapes,
  Search,
  X,
} from "lucide-react";
import { CATEGORIES } from "@/lib/seo/tool-schema";
import { categoryIcon } from "@/lib/category-icons";
import type { SortKey, SortDir } from "@/features/catalog/types";
import { searchPath, updateSearchParams } from "@/features/catalog/urls";
import { cn } from "@/lib/utils";

const SEARCH_EXAMPLES = [
  "meeting transcription",
  "API testing",
  "image generation",
];

const VIEW_OPTIONS = [
  { value: "cards" as const, label: "Cards", icon: LayoutGrid },
  { value: "list" as const, label: "List", icon: List },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "time", label: "Time" },
  { key: "name", label: "Name" },
  { key: "dr", label: "DR" },
];

export type ViewMode = "cards" | "list";

interface Props {
  q: string;
  onQChange: (v: string) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSortChange: (k: SortKey) => void;
  onToggleDir: () => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  count: number;
  showExamples?: boolean;
  showCategory?: boolean;
}

export function ToolToolbar({
  q,
  onQChange,
  sortKey,
  sortDir,
  onSortChange,
  onToggleDir,
  view,
  onViewChange,
  count,
  showExamples = true,
  showCategory = true,
}: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sortLabel =
    sortKey === "time"
      ? sortDir === "desc"
        ? "Time (newest)"
        : "Time (oldest)"
      : sortKey === "name"
        ? sortDir === "asc"
          ? "Name (A–Z)"
          : "Name (Z–A)"
        : sortDir === "desc"
          ? "DR (high → low)"
          : "DR (low → high)";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-card p-2">
        <div className="flex flex-wrap items-center gap-2 lg:flex-nowrap lg:gap-1">
          <SearchControl q={q} onQChange={onQChange} inputRef={inputRef} />
          {showCategory && <VDivider />}
          {showCategory && <CategoryMenu />}
          <VDivider />
          <SortMenu
            sortKey={sortKey}
            sortDir={sortDir}
            label={sortLabel}
            onChange={onSortChange}
            onToggleDir={onToggleDir}
          />
          <VDivider />
          <ViewSwitcher value={view} onChange={onViewChange} />
          <span className="ml-auto hidden whitespace-nowrap px-3 text-xs tabular-nums text-muted-foreground lg:inline-block">
            {count} results
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:hidden">
        <span className="text-xs tabular-nums text-muted-foreground">
          {count} results
        </span>
        {showExamples && (
          <p className="text-xs text-muted-foreground">
            Search by task or tool name
          </p>
        )}
      </div>

      {showExamples && (
        <ul className="hidden flex-wrap items-center gap-2 text-xs md:flex">
          <li className="mr-1 text-muted-foreground">Try searching</li>
          {SEARCH_EXAMPLES.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                onClick={() => {
                  onQChange(ex);
                  inputRef.current?.focus();
                }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground transition-colors hover:border-accent/30 hover:text-accent"
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VDivider() {
  return (
    <div aria-hidden className="hidden h-5 w-px shrink-0 bg-border lg:block" />
  );
}

function SearchControl({
  q,
  onQChange,
  inputRef,
}: {
  q: string;
  onQChange: (v: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <label
      htmlFor="tool-search"
      className={cn(
        "group flex h-12 min-w-0 basis-full items-center gap-3 rounded-xl border bg-background px-4 transition-colors duration-200 lg:basis-auto lg:flex-1",
        focused
          ? "border-accent/60 ring-2 ring-accent/10"
          : "border-transparent hover:border-border",
      )}
    >
      <Search
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          focused ? "text-accent" : "text-muted-foreground",
        )}
      />
      <input
        id="tool-search"
        ref={inputRef}
        type="search"
        value={q}
        onChange={(e) => onQChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search tools, workflows or use cases..."
        aria-label="Search AI tools"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
      />
      {q ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onQChange("");
            inputRef.current?.focus();
          }}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : (
        <span
          aria-hidden
          className="hidden items-center gap-1 rounded-md border border-border bg-card px-1.5 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex"
        >
          <kbd className="font-sans">⌘</kbd>
          <kbd className="font-sans">K</kbd>
        </span>
      )}
    </label>
  );
}

function CategoryMenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeSlug = searchParams.get("category");
  const active = CATEGORIES.find((c) => c.slug === activeSlug) ?? null;
  const label = active?.name ?? "All categories";
  const hasFilter = !!active;

  function pick(slug: string | null) {
    const params = updateSearchParams(
      new URLSearchParams(searchParams.toString()),
      { category: slug },
    );
    router.replace(searchPath(params), { scroll: false });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm transition-colors md:w-auto",
          hasFilter
            ? "bg-accent/10 text-accent"
            : "text-foreground hover:bg-secondary",
        )}
      >
        <Shapes className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-3 w-64 overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_12px_40px_-10px_rgb(32_39_34/0.15)]"
        >
          <button
            type="button"
            role="option"
            aria-selected={!hasFilter}
            onClick={() => pick(null)}
            className={cn(
              "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary",
              !hasFilter ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span>All categories</span>
            {!hasFilter && <Check className="h-3.5 w-3.5 text-accent" />}
          </button>
          <div className="my-1 h-px bg-border" aria-hidden />
          {CATEGORIES.map((c) => {
            const Icon = categoryIcon(c.slug);
            const isActive = c.slug === activeSlug;
            return (
              <button
                key={c.slug}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => pick(c.slug)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary",
                  isActive ? "text-accent" : "text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-accent" : "text-muted-foreground",
                  )}
                />
                <span className="flex-1 truncate">{c.name}</span>
                {isActive && <Check className="h-3.5 w-3.5 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SortMenu({
  sortKey,
  sortDir,
  label,
  onChange,
  onToggleDir,
}: {
  sortKey: SortKey;
  sortDir: SortDir;
  label: string;
  onChange: (k: SortKey) => void;
  onToggleDir: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={onToggleDir}
        title={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"} — click to toggle`}
        aria-label={`Sort direction: ${sortDir === "asc" ? "ascending" : "descending"}`}
        className="inline-flex h-10 items-center justify-center rounded-xl px-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl px-2 text-sm text-foreground transition-colors hover:bg-secondary"
      >
        <span className="whitespace-nowrap">{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-3 w-48 overflow-hidden rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_12px_40px_-10px_rgb(32_39_34/0.15)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="option"
              aria-selected={sortKey === opt.key}
              onClick={() => {
                onChange(opt.key);
                setOpen(false);
              }}
              className={cn(
                "block w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary",
                sortKey === opt.key
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span>{opt.label}</span>
                <span className="text-xs text-muted-foreground">
                  {sortKey === opt.key
                    ? sortDir === "asc"
                      ? "↑ asc"
                      : "↓ desc"
                    : ""}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label="View mode"
      className="ml-auto inline-flex items-center rounded-xl bg-secondary p-1 lg:ml-1"
    >
      {VIEW_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
