import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppUser, SessionUser } from "@/lib/supabase/types";

export const SESSION_COOKIE_NAME = "__Host-aiknows_session";

export class AuthError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "AuthError";
  }
}

function sessionMaxAgeSeconds() {
  const days = Number(process.env.AUTH_SESSION_DAYS ?? "30");
  return (Number.isFinite(days) && days > 0 ? days : 30) * 24 * 60 * 60;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function toSessionUser(user: AppUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatar_url,
    isAdmin: user.is_admin,
  };
}

function getCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

async function getSessionToken(request?: NextRequest) {
  if (request) {
    return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  }

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function getCurrentUser(request?: NextRequest): Promise<SessionUser | null> {
  const token = await getSessionToken(request);
  if (!token) return null;

  const admin = createAdminClient();
  const tokenHash = hashToken(token);
  const now = new Date().toISOString();

  const { data: session, error: sessionError } = await admin
    .from("app_sessions")
    .select("id, user_id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (sessionError || !session) {
    if (sessionError) console.error("[auth/session] lookup failed:", sessionError);
    return null;
  }

  const { data: user, error: userError } = await admin
    .from("app_users")
    .select("id, email, email_verified, name, avatar_url, is_admin, created_at, updated_at")
    .eq("id", session.user_id)
    .maybeSingle();

  if (userError || !user) {
    if (userError) console.error("[auth/session] user lookup failed:", userError);
    return null;
  }

  await admin
    .from("app_sessions")
    .update({ last_seen_at: now })
    .eq("id", session.id);

  return toSessionUser(user as AppUser);
}

export async function requireUser(request?: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new AuthError("Not authenticated", 401);
  }
  return user;
}

export async function requireAdmin(request?: NextRequest) {
  const user = await requireUser(request);
  if (!user.isAdmin) {
    throw new AuthError("Not authorized", 403);
  }
  return user;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds() * 1000);
  const admin = createAdminClient();

  const { error } = await admin.from("app_sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    throw new Error(`Could not create session: ${error.message}`);
  }

  return { token, expiresAt };
}

export async function revokeCurrentSession(request?: NextRequest) {
  const token = await getSessionToken(request);
  if (!token) return;

  const admin = createAdminClient();
  const { error } = await admin
    .from("app_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("token_hash", hashToken(token))
    .is("revoked_at", null);

  if (error) {
    throw new Error(`Could not revoke session: ${error.message}`);
  }
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    ...getCookieOptions(sessionMaxAgeSeconds()),
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    ...getCookieOptions(0),
  });
}

export function assertSameOriginRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) {
    throw new AuthError("Invalid request origin", 403);
  }
}

export function authErrorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  throw error;
}
