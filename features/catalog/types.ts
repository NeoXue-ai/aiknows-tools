/** Only published content belongs here. No database, account or moderation fields. */
export interface ToolGuide {
  checkedAt: string;
  features: { label: string; text: string }[];
  useCases: { label: string; text: string }[];
  limitations: string[];
  platforms: string[];
  pricingNote: string;
  pricingUrl: string;
  alternatives: { slug: string; reason: string }[];
  sources: { label: string; url: string }[];
}
export interface EditorialEntry {
  guide?: ToolGuide;
  comparison?: {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    points?: { label: string; text: string }[];
  };
  faqs?: { question: string; answer: string }[];
  externalLinks?: { label: string; url: string; context: string }[];
}
export interface ToolRecord {
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  url: string;
  logo_url: string | null;
  screenshot_url: string | null;
  primary_category: string;
  subcategory: string | null;
  tags: string[];
  pricing_detail: string | null;
  source: string | null;
  dr: number | null;
  is_featured: boolean;
  is_verified: boolean;
  /** Unknown publication dates stay null. */
  published_at: string | null;
  editorial?: EditorialEntry;
}
export type Tool = ToolRecord & { sub: string | null };
export type ToolSummary = Pick<
  ToolRecord,
  | "slug"
  | "name"
  | "tagline"
  | "url"
  | "logo_url"
  | "screenshot_url"
  | "primary_category"
  | "subcategory"
  | "pricing_detail"
  | "source"
  | "dr"
  | "published_at"
>;
export interface Category {
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
}
export interface CatalogQuery {
  q: string;
  category?: string;
  subcategory?: string;
  sort: "time" | "name" | "dr";
  dir: "asc" | "desc";
  page: number;
}
export interface CatalogPage {
  items: ToolSummary[];
  total: number;
  page: number;
  totalPages: number;
}

export type SortKey = CatalogQuery["sort"];
export type SortDir = CatalogQuery["dir"];
