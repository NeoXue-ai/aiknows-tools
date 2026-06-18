import { NextResponse, type NextRequest } from "next/server";
import {
  assertSameOriginRequest,
  authErrorResponse,
  clearSessionCookie,
  revokeCurrentSession,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest(request);
    await revokeCurrentSession(request);
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    return authErrorResponse(error);
  }
}
