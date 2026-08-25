import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_COOKIE_NAME = "__Host-aiknows_session";

export function proxy(request: NextRequest, event: NextFetchEvent) {
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

  // Admin auth gate (preserved from original).
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Fire-and-forget: capture IP / UA / path so we can investigate
  // bot-shaped traffic patterns (e.g. the /tools/rcmp-eligibility-checker
  // spike observed Aug 2026) instead of guessing from Vercel analytics
  // aggregates. Logging never blocks or fails the response.
  event.waitUntil(captureRequest(request));

  return NextResponse.next();
}

async function captureRequest(request: NextRequest): Promise<void> {
  try {
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "0.0.0.0";

    const ua = request.headers.get("user-agent") ?? "";
    const path = request.nextUrl.pathname;
    const referer = request.headers.get("referer") || null;
    const country = request.headers.get("x-vercel-ip-country") || null;
    const method = request.method;

    let isSuspicious = false;
    let suspicionReason: string | null = null;

    if (!ua) {
      isSuspicious = true;
      suspicionReason = "empty-ua";
    } else if (/MSIE|Trident\//i.test(ua)) {
      isSuspicious = true;
      suspicionReason = "dead-browser";
    }

    const admin = createAdminClient();
    await admin.from("request_logs").insert({
      ip,
      ua,
      path,
      referer,
      country,
      method,
      is_suspicious: isSuspicious,
      suspicion_reason: suspicionReason,
    });
  } catch (err) {
    console.error("[proxy] request_logs insert failed:", err);
  }
}

// Bot UA fingerprints — patterns no real browser/UA combination produces.
// These are the hard blocks above; captureRequest() still uses the
// conservative is_suspicious flags for soft analysis.
// Sources: Aug 2026 botnet shifted to Cloudflare path after the direct-IP
// block went live; observed ~50% of remaining traffic matches these.
function isBotUa(ua: string): boolean {
  if (!ua) return true; // empty UA — only headless bots do this
  // Windows Phone shipped Trident/EdgeHTML, never WebKit. WP + WebKit = bot.
  if (/Windows Phone.*AppleWebKit/i.test(ua)) return true;
  if (/Windows Phone.*Android/i.test(ua)) return true; // WP can't run Android
  // Firefox rv:40-49 shipped 2015–2016, before Android 10/11 existed.
  // Modern Android (10+) on Firefox 40-49 = bot spoofing.
  const ffMatch = ua.match(/rv:(\d{2})\./);
  if (ffMatch && /^Mozilla\/5\.0 \(Linux; Android (1[0-9]|[2-9][0-9])/i.test(ua)) {
    const rv = parseInt(ffMatch[1], 10);
    if (rv >= 40 && rv <= 49) return true;
  }
  return false;
}

// Match all dynamic paths. Excludes static assets so we don't log every
// CSS / JS / image fetch. /admin/* still passes through the auth gate
// above before reaching captureRequest.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|css|js|map)).*)",
  ],
};