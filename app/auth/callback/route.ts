// Magic-link + OAuth callback. Supabase (OTP email or OAuth provider) bounces
// the user here with ?code=...&next=.... We exchange the code for a session,
// which requires writing auth cookies to the RESPONSE so the browser keeps
// them across the subsequent redirect.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(
      new URL("/admin/login?error=missing_code", origin)
    );
  }

  // Build the response first so the cookie adapter can mutate it.
  // exchangeCodeForSession triggers an internal SIGNED_IN event, which
  // calls setAll — we forward those cookies onto the redirect response.
  let response = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.redirect(new URL(next, origin));
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error);
    return NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(error.message)}`, origin)
    );
  }

  return response;
}
