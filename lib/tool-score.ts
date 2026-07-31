import type { Tool } from "@/lib/supabase/types";
import { categoryName } from "@/lib/seo/tool-schema";

export type UserType =
  | "Founder"
  | "Creator"
  | "Developer"
  | "Marketing"
  | "Designer"
  | "Researcher"
  | "Business";

const CATEGORY_TO_USERS: Record<string, UserType[]> = {
  "writing-content": ["Creator"],
  "seo-marketing": ["Marketing", "Founder"],
  "image-video": ["Creator", "Designer"],
  "code-development": ["Developer"],
  "productivity": ["Founder", "Business"],
  "business-analytics": ["Founder", "Business"],
  "ecommerce-sales": ["Founder"],
  "research-data": ["Researcher"],
};

/** 1–2 labels per tool, derived purely from primary_category. */
export function getBestFor(tool: Tool): UserType[] {
  return CATEGORY_TO_USERS[tool.primary_category] ?? ["Business"];
}

// ---------- Task / User-type taxonomy (for filters) ----------

export const TASKS = [
  "Content Creation",
  "Coding",
  "Marketing",
  "Design",
  "Music",
  "Research",
] as const;
export type Task = (typeof TASKS)[number];

export const PRICING_OPTIONS = ["Free", "Freemium", "Paid"] as const;
export type PricingOption = (typeof PRICING_OPTIONS)[number];

export const USER_TYPES = [
  "Founder",
  "Creator",
  "Developer",
  "Business",
] as const;
export type UserTypeFilter = (typeof USER_TYPES)[number];

// category → primary task mapping (used to map Task filter → category)
const CATEGORY_TO_TASKS: Record<string, Task[]> = {
  "writing-content": ["Content Creation"],
  "seo-marketing": ["Marketing"],
  "image-video": ["Design", "Music"],
  "code-development": ["Coding"],
  "productivity": [],
  "business-analytics": [],
  "ecommerce-sales": [],
  "research-data": ["Research"],
};

const TASK_TO_CATEGORIES: Record<Task, string[]> = Object.fromEntries(
  TASKS.map((t) => [t, Object.keys(CATEGORY_TO_TASKS).filter((c) => CATEGORY_TO_TASKS[c]!.includes(t))]),
) as Record<Task, string[]>;

// category → user-type mapping (used to map UserType filter → category)
const CATEGORY_TO_USER_TYPES: Record<string, UserTypeFilter[]> = {
  "writing-content": ["Creator"],
  "seo-marketing": ["Founder"],
  "image-video": ["Creator"],
  "code-development": ["Developer"],
  "productivity": ["Founder", "Business"],
  "business-analytics": ["Founder", "Business"],
  "ecommerce-sales": ["Founder"],
  "research-data": [],
};

const USER_TYPE_TO_CATEGORIES: Record<UserTypeFilter, string[]> = Object.fromEntries(
  USER_TYPES.map((u) => [
    u,
    Object.keys(CATEGORY_TO_USER_TYPES).filter((c) =>
      CATEGORY_TO_USER_TYPES[c]!.includes(u),
    ),
  ]),
) as Record<UserTypeFilter, string[]>;

// ---------- Sorting ----------

export type SortKey = "time" | "name" | "dr";
export type SortDir = "asc" | "desc";

// ---------- Filtering & sorting ----------

export interface ToolFilters {
  q: string;
  task?: Task | null;
  pricing?: PricingOption | null;
  userType?: UserTypeFilter | null;
  sort: SortKey;
  dir: SortDir;
}

function timeValue(tool: Tool): number {
  const stamp =
    tool.published_at ??
    tool.updated_at ??
    tool.submitted_at ??
    tool.created_at;
  const t = stamp ? Date.parse(stamp) : 0;
  return Number.isFinite(t) ? t : 0;
}

export function filterTools(tools: Tool[], filters: ToolFilters): Tool[] {
  const q = filters.q.trim().toLowerCase();
  let out = tools.filter((t) => {
    if (q) {
      const hay = [
        t.name,
        t.tagline ?? "",
        t.description ?? "",
        categoryName(t.primary_category),
        ...(t.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.task) {
      const cats = TASK_TO_CATEGORIES[filters.task] ?? [];
      if (!cats.includes(t.primary_category)) return false;
    }
    if (filters.userType) {
      const cats = USER_TYPE_TO_CATEGORIES[filters.userType] ?? [];
      if (!cats.includes(t.primary_category)) return false;
    }
    if (filters.pricing) {
      const pt = t.pricing_type;
      if (filters.pricing === "Free") {
        if (pt !== "free") return false;
      } else if (filters.pricing === "Freemium") {
        if (pt !== "freemium") return false;
      } else if (filters.pricing === "Paid") {
        if (pt !== "paid" && pt !== "enterprise") return false;
      }
    }
    return true;
  });

  const dir = filters.dir === "asc" ? 1 : -1;

  if (filters.sort === "name") {
    out = [...out].sort((a, b) => dir * a.name.localeCompare(b.name));
  } else if (filters.sort === "dr") {
    // DR desc by default: tools with DR first, then nulls at the end.
    out = [...out].sort((a, b) => {
      const aHas = typeof a.dr === "number";
      const bHas = typeof b.dr === "number";
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (aHas && bHas) {
        const d = (a.dr as number) - (b.dr as number);
        if (d !== 0) return filters.dir === "asc" ? d : -d;
      }
      return a.name.localeCompare(b.name);
    });
  } else {
    // time — newest first when dir=desc
    out = [...out].sort((a, b) => {
      const d = timeValue(b) - timeValue(a);
      if (d !== 0) return filters.dir === "asc" ? -d : d;
      return a.name.localeCompare(b.name);
    });
  }
  return out;
}

export function pricingLabel(p: Tool["pricing_type"]): string {
  switch (p) {
    case "free":
      return "Free";
    case "freemium":
      return "Freemium";
    case "paid":
      return "Paid";
    case "enterprise":
      return "Enterprise";
    default:
      return "—";
  }
}

export function timeLabel(iso: string | null | undefined): string {
  if (!iso) return "Not recorded";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "Not recorded";
  return new Date(t).toISOString().slice(0, 10);
}