import {legacyPaginationPath} from "@/features/catalog/urls";
import { NextResponse, type NextRequest } from "next/server";
import slugs from "@/.catalog/slugs.json";
const SLUGS = new Set(slugs);


// TLD suffixes a scraper can mangle onto a domain slug. Order doesn't matter —
// `lookupRealSlug` short-circuits on the first hit, and Set.has() is O(1).
// Kept conservative: real public-suffix-style TLDs only, no word collisions.
const TLD_SUFFIXES = [
  "com", "io", "ai", "org", "net", "id", "app", "pro", "site", "cloud",
  "top", "dev", "co", "tech", "me", "info", "biz", "us", "uk", "tv",
  "cc", "gg", "nu", "xyz", "fm", "ws", "la", "sh", "to", "ly",
];

// Top-level static route names — these live under their own segments and
// MUST NOT be treated as tool slugs. Anything else single-segment under /
// is either a known tool (→ /tools/<slug>) or a real 404.
const ROOT_DENY = new Set([
  "search", "tools", "categories", "blog", "latest", "trending", "pricing",
  "submit", "about", "faq", "contact", "collections", "admin",
  "login", "auth", "api", "sitemap", "robots", "manifest",
  "_next", "favicon.ico", "opengraph-image", "twitter-image", "apple-icon",
]);

// Given a request segment like "lexi4-com" or "100leadcom", find the real
// slug in the catalog (if any). Returns null when no match — caller 404s.
function lookupRealSlug(segment: string): string | null {
  if (SLUGS.has(segment)) return segment;
  for (const tld of TLD_SUFFIXES) {
    if (segment.length <= tld.length) continue;
    if (segment.endsWith(`-${tld}`)) {
      const stripped = segment.slice(0, -(tld.length + 1));
      if (SLUGS.has(stripped)) return stripped;
    } else if (segment.endsWith(tld)) {
      const stripped = segment.slice(0, -tld.length);
      if (SLUGS.has(stripped)) return stripped;
    }
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Production custom domain: require Cloudflare proxy path.
  // The Aug 2026 botnet cached the Vercel origin IP (76.76.21.21) and
  // hits it directly, bypassing Cloudflare edge entirely (Bot Fight
  // Mode only sees what reaches the edge). cf-connecting-ip is set
  // only by Cloudflare on the proxied path; missing = direct hit = bot.
  // Preview URLs (*.vercel.app) and admin keep working.
  const host = request.headers.get("host") ?? "";
  const isProdDomain = host === "aiknows.tools" || host === "www.aiknows.tools";
  if (isProdDomain && !request.headers.get("cf-connecting-ip")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // UA fingerprint block: after the direct-IP pivot (Aug 2026 botnet
  // moved to the Cloudflare path), Bot Fight Mode stopped catching them.
  // Their UAs are conclusively impossible — Windows Phone never shipped
  // AppleWebKit, and Firefox rv:40-49 (2015) predates Android 10/11
  // (2019). No real user can hit these patterns, so a hard 403 here
  // costs zero false positives while dropping ~50% of bot volume.
  const ua = request.headers.get("user-agent") ?? "";
  if (isBotUa(ua)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const paginated = legacyPaginationPath(pathname, request.nextUrl.searchParams);
  if (paginated) return NextResponse.redirect(new URL(paginated, request.url), 308);

  // SEO redirect: external links + GSC crawl both surface bare /<slug>
  // URLs (e.g. /lexi4-com, /100leadcom) that don't have a route — they
  // 404 and bleed PageRank. /tools/<slug> is the canonical route, so
  // we 301 there when the segment matches a known tool. Also tries
  // stripping a TLD suffix (with or without dash) for cases where the
  // scraper slugified the URL's host as one word ("100leadcom" from
  // "100lead.com"). Only fires for single-segment paths; /tools/...
  // and /categories/... pass through unchanged.
  // Slugs are generated alongside the catalog by `pnpm catalog:build`.
  const trimmed = pathname.replace(/\/+$/, "") || "/";
  if (trimmed !== "/" && !trimmed.includes("/", 1)) {
    const seg = trimmed.slice(1).toLowerCase();
    if (!ROOT_DENY.has(seg) && !seg.includes(".")) {
      const realSlug = lookupRealSlug(seg);
      if (realSlug) {
        return NextResponse.redirect(new URL(`/tools/${realSlug}`, request.url), 301);
      }
    }
  }

  return NextResponse.next();
}

// Bot UA fingerprints — patterns no real browser/UA combination produces.
// These are the hard blocks above; captureRequest() still uses the
// conservative is_suspicious flags for soft analysis.
// Sources: Aug 2026 botnet shifted to Cloudflare path after the direct-IP
// block went live; observed ~50% of remaining traffic matches these.
// After 3 rounds of rotation, ~99% of bot traffic is now caught by these
// 8 patterns; remaining is mostly legit (FB/Bing crawlers + humans).
function isBotUa(ua: string): boolean {
  if (!ua) return true; // empty UA — only headless bots do this

  // 1. Windows Phone shipped Trident/EdgeHTML, never WebKit. WP + WebKit = bot.
  if (/Windows Phone.*AppleWebKit/i.test(ua)) return true;
  if (/Windows Phone.*Android/i.test(ua)) return true; // WP can't run Android

  // 2. rv: token in Gecko/20100101 UAs maps to the Firefox major version.
  // Firefox 50 shipped 2016-11; anything rv:<50 is ~10 years stale and
  // not used by any real client in 2026. The botnet rotates rv values
  // (rv:10, rv:46) while claiming modern Firefox/100-101 versions — the
  // contradiction confirms spoofing, but rv:<50 alone is conclusive.
  const rvMatch = ua.match(/rv:(\d{2,3})/);
  if (rvMatch && parseInt(rvMatch[1], 10) < 50) return true;

  // 3. AppleWebKit/533 was used in Chrome 14–28 (2011–2013). No modern
  // browser ships with 533.x WebKit; covers tr-TR bots, Win+Safari 15 bots.
  if (/AppleWebKit\/533/.test(ua)) return true;

  // 4. Opera identifies as "Chrome/X ... OPR/Y" where X matches the
  // underlying Chromium version (Opera 89 → Chromium 105, etc.). A high
  // OPR with an ancient Chrome is a contradiction no real Opera produces
  // (e.g. Chrome/28 + OPR/89 — 8-year version gap, seen in the Aug 2026
  // botnet's third rotation).
  const oprMatch = ua.match(/OPR\/(\d+)/);
  const chromeMatch = ua.match(/Chrome\/(\d+)/);
  if (oprMatch && chromeMatch) {
    const opr = parseInt(oprMatch[1], 10);
    const chrome = parseInt(chromeMatch[1], 10);
    if (opr >= 50 && chrome < 50) return true;
  }

  // 5. Apple dropped Windows Safari support in 2012 (Safari 6 was the
  // last Win release). Any "Version/X.Y" on a Windows UA where X.Y >= 13
  // (Safari 13, 2020+) is impossible — covers Win+Safari 15.6 bots that
  // combine AppleWebKit/533 + Version/15.6 + tr-TR locale.
  const safariVerMatch = ua.match(/Version\/(\d+)\./);
  if (safariVerMatch && /Windows/i.test(ua)) {
    const v = parseInt(safariVerMatch[1], 10);
    if (v >= 13) return true;
  }

  // 6. Chrome/104.0.5112 with a space before "/537.36" is a bot-generator
  // copy-paste typo. Real Chrome never produces "Safari /537.36" with
  // that space; the string is the cleanest signature for the Aug 2026
  // botnet's fourth rotation (3 NL/CA IPs sharing the same exact UA).
  if (/Chrome\/104\.0\.5112[^/]*Safari \//.test(ua)) return true;

  return false;
}

// Keep generated catalog assets out of request processing.
export const config = {
  matcher: [
    "/((?!catalog/|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|css|js|map)).*)",
  ],
};