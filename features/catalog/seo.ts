import type { Tool } from "./types";

// SEO: titles must survive Google's ~60-char truncation, so the whole title
// (brand + hint) is budgeted rather than the hint alone. The catalog is machine
// scraped — taglines carry markdown, URLs, emoji and their own tool name — so
// every source is normalized before it reaches the <title>.
const TITLE_BUDGET = 60;
const TITLE_SEP = " — ";

const EMOJI_RE =
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2190}-\u{21FF}]/gu;

const COPULA_RE = /^(?:is|are|was|were|has|have|had)\b[\s,]*/i;
const VERB_RE =
  /^(?:is|are|was|were|has|have|had|provides?|offers?|helps?|lets?|allows?|generates?|creates?|makes?|builds?|turns?|converts?|brings?|gives?|delivers?|powers?|enables?)\b[\s,]*/i;
const DETERMINER_RE =
  /^(?:a|an|the|any|all|each|every|some|many|your|their|his|her|its|our|my|more|better|new|free|you|us|me|them|one|two|three)\b/i;
const LEAD_ARTICLE_RE = /^(?:a|an|the)\s+/i;
const LEAD_PREP_RE =
  /^(?:with|from|by|on|via|using|through|for)\s+[^,]{1,40},\s*/i;
const DANGLING_RE =
  /\s+(?:is|are|was|were|be|been|to|for|with|and|or|of|in|on|at|by|from|as|that|which|the|a|an|your|its|this|these|it|&|,|-|–|—|:)\s*$/i;
const GAP_RE =
  /(?:^|\s)(?:your|my|our|its|his|her|the|a|an)\s+(?:for|with|and|or|to|in|on|of|at|by|from)\b/i;
// Some rows store a whole SEO title in `name` ("Fansloader — Free OnlyFans Downloader").
const NAME_SPLIT_RE = /^(.+?)(?:\s*[—–-]\s+|\s*\|\s+|\s*:\s+|\s*,\s+)(.+)$/;

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Copy often drops the spaces in the brand ("TankBlaster" vs "Tank Blaster").
// The lookahead below stops this from matching inside longer words.
function looseRe(name: string): string {
  return name.split(/\s+/).map(escapeRe).join("\\s*");
}

function cleanText(input: string | null | undefined): string {
  if (!input) return "";
  return String(input)
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:3[49]|x27);/gi, "'")
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(EMOJI_RE, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/(?<!\w)[*_](?=\S)|(?=\S)[*_](?!\w)|(?<=\S)[*_](?!\w)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const letterCount = (s: string) => s.replace(/[^\p{L}\p{N}]/gu, "").length;

const trimTail = (s: string) =>
  s
    .replace(/[.!?]+\s*$/, "")
    .replace(/[\s,;:.\-–—]+$/, "")
    .trim();

function stripName(src: string, name: string): string {
  if (!name) return src;
  const loose = looseRe(name);
  const possessive = new RegExp(
    `([^\\p{L}\\p{N}])${loose}['’]s(?=$|[^\\p{L}\\p{N}])`,
    "giu",
  );
  const plain = new RegExp(
    `(^|[^\\p{L}\\p{N}])${loose}['’]?(?:s|re)?[?!:;.,]?(?=$|[^\\p{L}\\p{N}])`,
    "giu",
  );
  let out = src.replace(possessive, "$1its").replace(plain, "$1");
  for (let i = 0; i < 2; i++) {
    const next = out.replace(plain, "$1");
    if (next === out) break;
    out = next;
  }
  out = out
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,;:.\-–—'"’]+/, "")
    .trim();
  // "Take your eye test online" -> "Take your for free" reads broken; keep the original.
  if (GAP_RE.test(out) && !GAP_RE.test(src)) return src;
  return out;
}

function prepareHint(sentence: string, name: string): string {
  const labeled = sentence.replace(
    /^(?:what it is|what it does|about|overview|features?|description)\s*[:\-—–]?\s*/i,
    "",
  );
  const nameLed =
    !!name && !!labeled.trim().match(new RegExp(`^${looseRe(name)}`, "i"));

  const segments = labeled
    .split(/\s+[—–]\s+|\s+-\s+/)
    .map((p) => stripName(p, name))
    .filter((p) => letterCount(p) >= 12);
  const pool = segments.length ? segments.join(". ") : labeled;

  // Brand glued to extra letters in the copy: "Chatterbox Turbo", "SajuGPTAI는".
  let base = pool;
  if (name.length >= 4) {
    const lead = pool.match(new RegExp(`^${looseRe(name)}`, "i"));
    const glued = lead && pool.charAt(lead[0].length);
    if (lead && glued && /[\p{L}\p{N}]/u.test(glued)) {
      base = pool
        .slice(lead[0].length)
        .replace(/^[^\p{L}\p{N}]+/u, "")
        .trim();
    }
  }
  base = stripName(base, name).replace(LEAD_PREP_RE, "").trim();

  let hint = base;
  let strippedVerb = false;
  for (let i = 0; i < 3; i++) {
    const m = hint.match(nameLed ? COPULA_RE : VERB_RE);
    if (!m) break;
    const rest = hint.slice(m[0].length);
    if (!COPULA_RE.test(m[0]) && DETERMINER_RE.test(rest)) break;
    hint = rest.trim();
    strippedVerb = true;
  }
  if (strippedVerb) hint = hint.replace(LEAD_ARTICLE_RE, "").trim();
  for (let i = 0; i < 2; i++) {
    const next = hint.replace(DANGLING_RE, "").trimEnd();
    if (next === hint) break;
    hint = next;
  }
  return trimTail(hint);
}

function clampHint(hint: string, budget: number, name: string): string {
  hint = trimTail(hint);
  if (hint.length <= budget) return hint;
  const cut = hint.slice(0, budget - 1);
  const lastSpace = cut.lastIndexOf(" ");
  let out = (
    lastSpace > budget * 0.6 ? cut.slice(0, lastSpace) : cut
  ).trimEnd();
  for (let i = 0; i < 3; i++) {
    const withoutName = name
      ? out.replace(new RegExp(`\\s+${escapeRe(name)}['’]?$`, "i"), "")
      : out;
    const next = withoutName.replace(DANGLING_RE, "").trimEnd();
    if (next === out) break;
    out = next;
  }
  return out + "…";
}

function deriveFunctionHint(tool: Tool, name: string, budget: number): string {
  const src = cleanText(tool.tagline) || cleanText(tool.description);
  if (!src) return cleanText(tool.sub) || "AI Tool";

  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  let hint = "";
  for (const sentence of sentences.slice(0, 3)) {
    const candidate = prepareHint(sentence, name);
    // "Bored with scrolling?" is a marketing hook, not a description.
    const isHook = candidate.length < 28 && /[?!]\s*$/.test(sentence);
    if (letterCount(candidate) >= 12 && !isHook) {
      hint = candidate;
      break;
    }
    hint = hint || candidate;
  }
  if (letterCount(hint) < 12) hint = cleanText(tool.sub) || "AI Tool";
  return clampHint(hint[0].toUpperCase() + hint.slice(1), budget, name);
}

export function buildTitle(tool: Tool): string {
  const full = cleanText(tool.name);
  if (!full) {
    const src = cleanText(tool.tagline) || cleanText(tool.description);
    if (!src) return cleanText(tool.sub) || "aiknows.tools";
    return clampHint(
      deriveFunctionHint(tool, "", TITLE_BUDGET),
      TITLE_BUDGET,
      "",
    );
  }

  const split = full.match(NAME_SPLIT_RE);
  const head =
    split && letterCount(split[1]) >= 4 && letterCount(split[2]) >= 8
      ? split[1].trim()
      : full;
  const tail = head === full ? "" : split![2].trim();

  if (head.length + TITLE_SEP.length >= TITLE_BUDGET) return head;
  const budget = TITLE_BUDGET - head.length - TITLE_SEP.length;

  let hint = "";
  if (tail) {
    const clauses = stripName(tail, head).split(/\s+[—–|]\s+/);
    const chosen = trimTail(
      clauses.find((c) => letterCount(c) >= 12) ?? clauses[0],
    );
    if (chosen) {
      const candidate = clampHint(
        chosen[0].toUpperCase() + chosen.slice(1),
        budget,
        head,
      );
      if (letterCount(candidate.replace(/…$/, "")) >= 12) hint = candidate;
    }
  }
  if (!hint) hint = deriveFunctionHint(tool, head, budget);
  if (!hint || head.toLowerCase() === hint.toLowerCase()) return head;
  return `${head}${TITLE_SEP}${hint}`;
}

export function deriveMetaDescription(tool: Tool): string {
  const trailing =
    " Listed on aiknows.tools — see source, recorded evidence, and editorial notes.";
  const budget = 158 - trailing.length;
  const source =
    cleanText(tool.tagline) ||
    cleanText(tool.description) ||
    cleanText(tool.sub);
  if (!source) {
    return `${tool.name} is recorded in the AIknows.tools index.`;
  }
  const head =
    source.length <= budget
      ? source
      : source
          .slice(0, budget - 1)
          .replace(DANGLING_RE, "")
          .trimEnd() + "…";
  return head + trailing;
}
