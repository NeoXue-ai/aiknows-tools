import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

export type OAuthProvider = "google" | "github";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  avatarUrl: string | null;
}

interface OAuthTransaction {
  provider: OAuthProvider;
  state: string;
  next: string;
  expiresAt: number;
  codeVerifier?: string;
}

interface ProviderConfig {
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
  pkce: boolean;
}

const OAUTH_COOKIE_NAME = "__Host-aiknows_oauth";
const OAUTH_MAX_AGE_SECONDS = 10 * 60;

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

export function sanitizeNext(rawNext: string | null | undefined) {
  if (!rawNext || !rawNext.startsWith("/") || rawNext.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(rawNext, "https://aiknows.local");
    if (url.origin !== "https://aiknows.local") return "/";
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return "/";
  }
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return secret;
}

function getSiteUrl(origin: string) {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? origin).replace(/\/$/, "");
}

function getProviderConfig(provider: OAuthProvider): ProviderConfig {
  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth is not configured");
    }
    return {
      clientId,
      clientSecret,
      authorizationUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["openid", "email", "profile"],
      pkce: true,
    };
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GitHub OAuth is not configured");
  }
  return {
    clientId,
    clientSecret,
    authorizationUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    scopes: ["read:user", "user:email"],
    pkce: false,
  };
}

function randomBase64Url(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function codeChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function encodeTransaction(transaction: OAuthTransaction) {
  const payload = Buffer.from(JSON.stringify(transaction)).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function decodeTransaction(value: string): OAuthTransaction | null {
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expected = signPayload(payload);
  const actualBuffer = Buffer.from(signature, "base64url");
  const expectedBuffer = Buffer.from(expected, "base64url");
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!isOAuthProvider(parsed.provider)) return null;
    if (typeof parsed.state !== "string") return null;
    if (typeof parsed.next !== "string") return null;
    if (typeof parsed.expiresAt !== "number") return null;
    if (parsed.codeVerifier && typeof parsed.codeVerifier !== "string") return null;
    return parsed;
  } catch {
    return null;
  }
}

function getOAuthCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function createAuthorizationUrl(provider: OAuthProvider, next: string, origin: string) {
  const config = getProviderConfig(provider);
  const state = randomBase64Url(32);
  const verifier = config.pkce ? randomBase64Url(64) : undefined;
  const redirectUri = `${getSiteUrl(origin)}/auth/callback`;
  const authorizationUrl = new URL(config.authorizationUrl);

  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", config.scopes.join(" "));
  authorizationUrl.searchParams.set("state", state);

  if (provider === "github") {
    authorizationUrl.searchParams.set("allow_signup", "true");
  }

  if (verifier) {
    authorizationUrl.searchParams.set("code_challenge", codeChallenge(verifier));
    authorizationUrl.searchParams.set("code_challenge_method", "S256");
  }

  const cookieValue = encodeTransaction({
    provider,
    state,
    next: sanitizeNext(next),
    expiresAt: Date.now() + OAUTH_MAX_AGE_SECONDS * 1000,
    codeVerifier: verifier,
  });

  return { authorizationUrl, cookieValue };
}

export function setOAuthTransactionCookie(response: NextResponse, value: string) {
  response.cookies.set({
    name: OAUTH_COOKIE_NAME,
    value,
    ...getOAuthCookieOptions(OAUTH_MAX_AGE_SECONDS),
  });
}

export function clearOAuthTransactionCookie(response: NextResponse) {
  response.cookies.set({
    name: OAUTH_COOKIE_NAME,
    value: "",
    ...getOAuthCookieOptions(0),
  });
}

export function readOAuthTransaction(request: NextRequest) {
  const value = request.cookies.get(OAUTH_COOKIE_NAME)?.value;
  if (!value) return null;

  const transaction = decodeTransaction(value);
  if (!transaction || transaction.expiresAt < Date.now()) return null;
  return transaction;
}

export function validateOAuthState(transaction: OAuthTransaction, state: string | null) {
  return Boolean(state && transaction.state === state);
}

export async function exchangeOAuthCode(
  provider: OAuthProvider,
  code: string,
  origin: string,
  codeVerifier?: string
) {
  const config = getProviderConfig(provider);
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    redirect_uri: `${getSiteUrl(origin)}/auth/callback`,
  });

  if (provider === "google") {
    body.set("grant_type", "authorization_code");
  }

  if (codeVerifier) {
    body.set("code_verifier", codeVerifier);
  }

  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
    },
    body,
  });

  const json = (await response.json()) as { access_token?: string; error?: string; error_description?: string };
  if (!response.ok || !json.access_token) {
    throw new Error(json.error_description ?? json.error ?? "OAuth token exchange failed");
  }

  return json.access_token;
}

export async function fetchOAuthProfile(provider: OAuthProvider, accessToken: string): Promise<OAuthProfile> {
  if (provider === "google") {
    return fetchGoogleProfile(accessToken);
  }
  return fetchGitHubProfile(accessToken);
}

async function fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Could not fetch Google profile");
  }

  const profile = (await response.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };

  if (!profile.sub || !profile.email || profile.email_verified !== true) {
    throw new Error("Google account email must be verified");
  }

  return {
    provider: "google",
    providerUserId: profile.sub,
    email: profile.email,
    emailVerified: true,
    name: profile.name ?? null,
    avatarUrl: profile.picture ?? null,
  };
}

async function fetchGitHubProfile(accessToken: string): Promise<OAuthProfile> {
  const headers = {
    authorization: `Bearer ${accessToken}`,
    accept: "application/vnd.github+json",
    "x-github-api-version": "2022-11-28",
  };

  const [userResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", { headers }),
    fetch("https://api.github.com/user/emails", { headers }),
  ]);

  if (!userResponse.ok || !emailsResponse.ok) {
    throw new Error("Could not fetch GitHub profile");
  }

  const user = (await userResponse.json()) as {
    id?: number;
    name?: string | null;
    login?: string;
    email?: string | null;
    avatar_url?: string | null;
  };
  const emails = (await emailsResponse.json()) as Array<{
    email: string;
    primary: boolean;
    verified: boolean;
  }>;

  const matchingVerified = user.email
    ? emails.find((item) => item.email === user.email && item.verified)
    : undefined;
  const primaryVerified = emails.find((item) => item.primary && item.verified);
  const selectedEmail = matchingVerified ?? primaryVerified;

  if (!user.id || !selectedEmail) {
    throw new Error("GitHub account must have a verified primary email");
  }

  return {
    provider: "github",
    providerUserId: String(user.id),
    email: selectedEmail.email,
    emailVerified: true,
    name: user.name ?? user.login ?? null,
    avatarUrl: user.avatar_url ?? null,
  };
}
