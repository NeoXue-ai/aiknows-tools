import editorialData from "@/data/editorial-content.json";
import type { Tool } from "@/lib/supabase/types";

export type EditorialComparisonPoint = {
  label: string;
  text: string;
};

export type EditorialComparison = {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  points?: EditorialComparisonPoint[];
};

export type EditorialFaq = {
  question: string;
  answer: string;
};

export type EditorialLink = {
  label: string;
  url: string;
  context: string;
};

export type EditorialEntry = {
  comparison?: EditorialComparison;
  faqs?: EditorialFaq[];
  externalLinks?: EditorialLink[];
};

const BY_SLUG = editorialData as Record<string, EditorialEntry>;

export function getEditorial(slug: string): EditorialEntry | null {
  return BY_SLUG[slug] ?? null;
}

export function editorialFaqs(tool: Tool): EditorialFaq[] {
  return getEditorial(tool.slug)?.faqs ?? [];
}
