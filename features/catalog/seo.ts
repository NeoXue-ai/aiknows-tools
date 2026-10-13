import type { Tool } from "./types";
import { CATEGORIES, subBySlug } from "./taxonomy";

// Prefer concise reviewed titles. Genuine long product names remain intact;
// this preference is not a search-engine character limit.
const TITLE_BUDGET = 60;
const TITLE_SEP = " — ";
const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu;
const NAME_SPLIT_RE = /^(.+?)(?:\s*[—–-]\s+|\s*\|\s+|\s*:\s+|\s*,\s+)(.+)$/;
// Some legacy name fields include a promotional SEO tail. This only cleans
// those tails; metadata never attempts to classify or summarize scraped prose.
const PROMOTIONAL_TAIL_RE =
  /\b(?:best|fastest|leading|largest|biggest|most|dominant|unlimited|trusted|ultimate|guaranteed)\b|#\s*1|world['’]s\s+(?:first|only)|\b\d[\d,.]*\s*(?:million|billion|users|contacts|seconds|%)\b/i;

function cleanText(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code: string) => {
      const point =
        code[0].toLowerCase() === "x"
          ? parseInt(code.slice(1), 16)
          : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : " ";
    })
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(EMOJI_RE, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/(?<!\w)[*_](?=\S)|(?=\S)[*_](?!\w)|(?<=\S)[*_](?!\w)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function productName(tool: Tool): string {
  const name = cleanText(tool.name);
  const split = name.match(NAME_SPLIT_RE);
  return split && PROMOTIONAL_TAIL_RE.test(split[2]) ? split[1].trim() : name;
}

function taxonomyHint(tool: Tool): string {
  return (
    (tool.subcategory ? subBySlug(tool.subcategory)?.name : undefined) ??
    CATEGORIES.find((category) => category.slug === tool.primary_category)
      ?.name ??
    "AI Tool"
  );
}

export function buildTitle(tool: Tool): string {
  if (tool.editorial?.seo) return tool.editorial.seo.title.trim();
  const name = productName(tool);
  const task = taxonomyHint(tool);
  if (!name) return task;
  // Keep complete neutral legacy titles and long identities rather than
  // appending more boilerplate or chopping the name into an ellipsis.
  if (
    NAME_SPLIT_RE.test(name) ||
    name.length + TITLE_SEP.length >= TITLE_BUDGET
  )
    return name;
  return name.toLowerCase() === task.toLowerCase()
    ? name
    : `${name}${TITLE_SEP}${task}`;
}

export function deriveMetaDescription(tool: Tool): string {
  if (tool.editorial?.seo) return tool.editorial.seo.description.trim();
  return `Explore ${productName(tool)} in the ${taxonomyHint(tool)} category on AIKnows, with product information, related tools and a link to the official website.`;
}
