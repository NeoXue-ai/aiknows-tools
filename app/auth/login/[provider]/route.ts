import { NextResponse, type NextRequest } from "next/server";
import {
  createAuthorizationUrl,
  isOAuthProvider,
  sanitizeNext,
  setOAuthTransactionCookie,
} from "@/lib/auth/oauth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> }
) {
  const { provider } = await context.params;
  const origin = request.nextUrl.origin;

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(new URL("/login?error=unknown_provider", origin));
  }

  try {
    const next = sanitizeNext(request.nextUrl.searchParams.get("next"));
    const { authorizationUrl, cookieValue } = createAuthorizationUrl(
      provider,
      next,
      origin
    );
    const response = NextResponse.redirect(authorizationUrl);
    setOAuthTransactionCookie(response, cookieValue);
    return response;
  } catch (error) {
    console.error("[auth/login] oauth start failed:", error);
    return NextResponse.redirect(new URL("/login?error=oauth_config", origin));
  }
}
