import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_COOKIE_NAME = "__Host-aiknows_session";

export function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

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

// Match all dynamic paths. Excludes static assets so we don't log every
// CSS / JS / image fetch. /admin/* still passes through the auth gate
// above before reaching captureRequest.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|css|js|map)).*)",
  ],
};