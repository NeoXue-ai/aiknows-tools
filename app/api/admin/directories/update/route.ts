import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  assertSameOriginRequest,
  authErrorResponse,
  requireAdmin,
} from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_STATUS = ["active", "dead", "unknown"] as const;
type DirectoryStatus = (typeof ALLOWED_STATUS)[number];

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

  const directoryId = typeof body.directoryId === "string" ? body.directoryId : null;
  if (!directoryId) {
    return NextResponse.json(
      { error: "directoryId is required" },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {};
  if ("status" in body) {
    if (
      typeof body.status !== "string" ||
      !(ALLOWED_STATUS as readonly string[]).includes(body.status)
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status as DirectoryStatus;
  }
  if ("last_checked" in body) {
    if (typeof body.last_checked !== "string") {
      return NextResponse.json(
        { error: "last_checked must be a string" },
        { status: 400 }
      );
    }
    updates.last_checked = body.last_checked;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[admin/directories/update] missing env:", err);
    return NextResponse.json(
      { error: "Server is missing Supabase configuration" },
      { status: 500 }
    );
  }

  const { error } = await admin
    .from("directories")
    .update(updates)
    .eq("id", directoryId);

  if (error) {
    console.error("[admin/directories/update] update failed:", error);
    return NextResponse.json(
      { error: "Could not update directory" },
      { status: 500 }
    );
  }

  try {
    revalidateTag("directories", "max");
    revalidateTag("public-directories", "max");
    revalidatePath("/");
    revalidatePath("/directories");
    revalidatePath("/sitemap.xml");
  } catch (err) {
    console.error("[admin/directories/update] revalidate failed:", err);
  }

  return NextResponse.json({ ok: true });
}
