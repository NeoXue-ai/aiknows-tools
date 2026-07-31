import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import directoriesData from "@/data/directories.json";
import { toolsData, toolsSnapshot } from "@/lib/tools-data";
import type { Directory, Tool } from "@/lib/supabase/types";

type StaticTool = Omit<
  Tool,
  | "id"
  | "dr"
  | "status"
  | "submitter_email"
  | "submitted_at"
  | "published_at"
  | "created_at"
  | "updated_at"
> & {
  source?: string | null;
  dr?: number | null;
};

type StaticDirectory = Omit<
  Directory,
  "id" | "status" | "last_checked" | "last_verified" | "created_at"
> & {
  status?: Directory["status"];
};

const STATIC_TIMESTAMP = toolsSnapshot.generatedAt ?? "1970-01-01T00:00:00.000Z";

const NOT_FOUND_SENTINEL = "sorry, the page you're looking for doesn't exist";
const NON_PRODUCT_HOSTS = new Set([
  "cdnjs.cloudflare.com",
  "unpkg.com",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "www.w3.org",
  "schema.org",
]);

function looksLikeNotFoundPage(record: { name?: string | null; tagline?: string | null; description?: string | null; url?: string | null }) {
  const tagline = record.tagline?.toLowerCase() ?? "";
  const description = record.description?.toLowerCase() ?? "";
  const name = record.name ?? "";
  const url = (record.url ?? "").toLowerCase();

  if (name.startsWith("/")) return true;
  if (tagline.includes(NOT_FOUND_SENTINEL)) return true;
  if (description.includes(NOT_FOUND_SENTINEL)) return true;
  if (url.includes("submitaitools.org")) return true;

  try {
    const host = new URL(record.url ?? "").hostname.toLowerCase();
    if (NON_PRODUCT_HOSTS.has(host)) return true;
  } catch {
    if (url.startsWith("http://") || url.startsWith("https://")) return true;
  }

  return false;
}

export function isValidPublicToolRecord(record: Partial<Tool>): boolean {
  if (!record.slug?.trim()) return false;
  if (!record.url?.trim()) return false;
  return !looksLikeNotFoundPage(record);
}

function staticTools(): Tool[] {
  return (toolsData as StaticTool[])
    .filter((tool) => isValidPublicToolRecord(tool))
    .map((tool) => ({
      ...tool,
      id: `static:${tool.slug}`,
      source: tool.source ?? null,
      dr: tool.dr ?? null,
      status: "approved",
      submitter_email: null,
      submitted_at: STATIC_TIMESTAMP,
      published_at: null,
      created_at: STATIC_TIMESTAMP,
      updated_at: STATIC_TIMESTAMP,
    }));
}

function staticDirectories(): Directory[] {
  return (directoriesData as StaticDirectory[]).map((directory) => ({
    ...directory,
    id: `static:${directory.slug}`,
    status: directory.status ?? "active",
    last_checked: null,
    last_verified: null,
    created_at: STATIC_TIMESTAMP,
  }));
}

function hasPublicSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim(),
  );
}

async function loadSupabaseTools(): Promise<Tool[]> {
  if (!hasPublicSupabaseConfig()) return [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("status", "approved")
    .order("name", { ascending: true });

  if (error) throw error;
  return (data ?? [])
    .filter((tool) => isValidPublicToolRecord(tool))
    .map((tool) => ({
      ...tool,
      source: tool.source ?? null,
    })) as Tool[];
}

async function loadSupabaseDirectories(): Promise<Directory[]> {
  if (!hasPublicSupabaseConfig()) return [];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("directories")
    .select("*")
    .eq("status", "active")
    .order("dr", { ascending: false, nullsFirst: false });

  if (error) throw error;
  return (data ?? []) as Directory[];
}

const getCachedSupabaseTools = unstable_cache(
  loadSupabaseTools,
  ["public-catalog-tools"],
  { tags: ["tools", "public-tools"], revalidate: 300 },
);

const getCachedSupabaseDirectories = unstable_cache(
  loadSupabaseDirectories,
  ["public-catalog-directories"],
  { tags: ["directories", "public-directories"], revalidate: 300 },
);

export async function getPublicTools(): Promise<Tool[]> {
  const fallback = staticTools();

  try {
    const tools = await getCachedSupabaseTools();
    return tools.length >= fallback.length ? tools : fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicToolBySlug(slug: string): Promise<Tool | null> {
  const tools = await getPublicTools();
  return tools.find((tool) => tool.slug === slug) ?? null;
}

export async function getPublicDirectories(): Promise<Directory[]> {
  const fallback = staticDirectories();

  try {
    const directories = await getCachedSupabaseDirectories();
    return directories.length >= fallback.length ? directories : fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicCatalogSummary() {
  const [tools, directories] = await Promise.all([
    getPublicTools(),
    getPublicDirectories(),
  ]);

  return {
    tools,
    directories,
    toolCount: tools.length,
    directoryCount: directories.length,
  };
}
