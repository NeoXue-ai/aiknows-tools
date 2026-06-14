import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_STATUS = ["active", "dead", "unknown"] as const;
type DirectoryStatus = (typeof ALLOWED_STATUS)[number];

async function requireAdmin(): Promise<
  { ok: true } | { ok: false; status: number; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, message: "Not authenticated" };
  const isAdmin = (user.app_metadata?.admin as boolean | undefined) ?? false;
  if (!isAdmin) return { ok: false, status: 401, message: "Not authorized" };
  return { ok: true };
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client is not configured");
  }
  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
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
    admin = getAdminClient();
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
    revalidatePath("/directories");
  } catch (err) {
    console.error("[admin/directories/update] revalidate failed:", err);
  }

  return NextResponse.json({ ok: true });
}
