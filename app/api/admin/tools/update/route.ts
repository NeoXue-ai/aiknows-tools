import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_FIELDS = ["is_featured", "is_verified", "status"] as const;
type AllowedField = (typeof ALLOWED_FIELDS)[number];

async function requireAdmin(): Promise<
  { ok: true } | { ok: false; status: number; message: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, message: "Not authenticated" };
  }
  const isAdmin = (user.app_metadata?.admin as boolean | undefined) ?? false;
  if (!isAdmin) {
    return { ok: false, status: 401, message: "Not authorized" };
  }
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
    admin = getAdminClient();
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
