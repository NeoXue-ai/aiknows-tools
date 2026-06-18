import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  assertSameOriginRequest,
  authErrorResponse,
  requireAdmin,
} from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_FIELDS = ["is_featured", "is_verified", "status"] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest(request);
    await requireAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const toolId = typeof body.toolId === "string" ? body.toolId : null;
  if (!toolId) {
    return NextResponse.json({ error: "toolId is required" }, { status: 400 });
  }

  const updates: Partial<Record<AllowedField, unknown>> = {};
  for (const field of ALLOWED_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (field === "status") {
        if (value !== "pending" && value !== "approved" && value !== "rejected") {
          return NextResponse.json(
            { error: `Invalid status: ${String(value)}` },
            { status: 400 }
          );
        }
      } else if (typeof value !== "boolean") {
        return NextResponse.json(
          { error: `${field} must be a boolean` },
          { status: 400 }
        );
      }
      updates[field] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[admin/tools/update] missing env:", err);
    return NextResponse.json(
      { error: "Server is missing Supabase configuration" },
      { status: 500 }
    );
  }

  const { error } = await admin.from("tools").update(updates).eq("id", toolId);

  if (error) {
    console.error("[admin/tools/update] update failed:", error);
    return NextResponse.json(
      { error: "Could not update tool" },
      { status: 500 }
    );
  }

  try {
    revalidateTag("tools", "max");
    revalidatePath("/tools");
    revalidatePath("/latest");
    revalidatePath("/");
  } catch (err) {
    console.error("[admin/tools/update] revalidate failed:", err);
  }

  return NextResponse.json({ ok: true });
}
