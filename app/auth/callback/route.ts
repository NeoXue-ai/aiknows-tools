import { NextResponse, type NextRequest } from "next/server";
import {
  clearOAuthTransactionCookie,
  exchangeOAuthCode,
  fetchOAuthProfile,
  readOAuthTransaction,
  sanitizeNext,
  validateOAuthState,
  type OAuthProfile,
} from "@/lib/auth/oauth";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const providerError = searchParams.get("error");

  if (providerError) {
    return redirectWithError(origin, "oauth_failed");
  }

  const transaction = readOAuthTransaction(request);
  if (!transaction) {
    return redirectWithError(origin, "oauth_invalid");
  }

  if (!code || !validateOAuthState(transaction, state)) {
    return redirectWithError(origin, "oauth_invalid_state");
  }

  try {
    const accessToken = await exchangeOAuthCode(
      transaction.provider,
      code,
      origin,
      transaction.codeVerifier
    );
    const profile = await fetchOAuthProfile(transaction.provider, accessToken);
    const userId = await upsertOAuthUser(profile);
    const { token } = await createSession(userId);
    const response = NextResponse.redirect(
      new URL(sanitizeNext(transaction.next), origin)
    );

    setSessionCookie(response, token);
    clearOAuthTransactionCookie(response);
    return response;
  } catch (error) {
    console.error("[auth/callback] oauth callback failed:", error);
    return redirectWithError(origin, "oauth_failed");
  }
}

function redirectWithError(origin: string, error: string) {
  const response = NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(error)}`, origin)
  );
  clearOAuthTransactionCookie(response);
  return response;
}

async function upsertOAuthUser(profile: OAuthProfile) {
  const admin = createAdminClient();
  const email = profile.email.toLowerCase();

  const { data: identity, error: identityError } = await admin
    .from("app_oauth_identities")
    .select("user_id")
    .eq("provider", profile.provider)
    .eq("provider_user_id", profile.providerUserId)
    .maybeSingle();

  if (identityError) {
    throw new Error(`Could not lookup OAuth identity: ${identityError.message}`);
  }

  let userId = identity?.user_id as string | undefined;

  if (!userId) {
    const { data: existingUser, error: existingUserError } = await admin
      .from("app_users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUserError) {
      throw new Error(`Could not lookup user: ${existingUserError.message}`);
    }

    userId = existingUser?.id as string | undefined;
  }

  if (userId) {
    const { error } = await admin
      .from("app_users")
      .update({
        email,
        email_verified: profile.emailVerified,
        name: profile.name,
        avatar_url: profile.avatarUrl,
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`Could not update user: ${error.message}`);
    }
  } else {
    const { data: newUser, error } = await admin
      .from("app_users")
      .insert({
        email,
        email_verified: profile.emailVerified,
        name: profile.name,
        avatar_url: profile.avatarUrl,
      })
      .select("id")
      .single();

    if (error || !newUser) {
      throw new Error(`Could not create user: ${error?.message ?? "missing user"}`);
    }

    userId = newUser.id as string;
  }

  const { error: upsertIdentityError } = await admin
    .from("app_oauth_identities")
    .upsert(
      {
        user_id: userId,
        provider: profile.provider,
        provider_user_id: profile.providerUserId,
        provider_email: email,
        provider_email_verified: profile.emailVerified,
      },
      { onConflict: "provider,provider_user_id" }
    );

  if (upsertIdentityError) {
    throw new Error(`Could not upsert OAuth identity: ${upsertIdentityError.message}`);
  }

  return userId;
}
