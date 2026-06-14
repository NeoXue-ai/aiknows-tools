import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notifySubmitterRejected } from "@/lib/email";
import type { Submission } from "@/lib/supabase/types";

async function requireAdmin(): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
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

  let body: { submissionId?: unknown; reason?: unknown };
  try {
    body = (await request.json()) as { submissionId?: unknown; reason?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const submissionId =
    typeof body.submissionId === "string" ? body.submissionId : null;
  const reason =
    typeof body.reason === "string" ? body.reason.trim() : "";

  if (!submissionId) {
    return NextResponse.json(
      { error: "submissionId is required" },
      { status: 400 }
    );
  }
  if (!reason) {
    return NextResponse.json(
      { error: "A rejection reason is required" },
      { status: 400 }
    );
  }
  if (reason.length > 1000) {
    return NextResponse.json(
      { error: "Rejection reason is too long" },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = getAdminClient();
  } catch (err) {
    console.error("[admin/reject] missing env:", err);
    return NextResponse.json(
      { error: "Server is missing Supabase configuration" },
      { status: 500 }
    );
  }

  const { data: existing, error: existingError } = await admin
    .from("submissions")
    .select("id, tool_name, submitter_email, status")
    .eq("id", submissionId)
    .single();

  if (existingError || !existing) {
    console.error("[admin/reject] submission lookup failed:", existingError);
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  if ((existing as Pick<Submission, "status">).status === "rejected") {
    return NextResponse.json(
      { error: "Submission has already been rejected" },
      { status: 409 }
    );
  }

  const { error: updateError } = await admin
    .from("submissions")
    .update({
      status: "rejected",
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateError) {
    console.error("[admin/reject] submission update failed:", updateError);
    return NextResponse.json(
      { error: "Could not update submission" },
      { status: 500 }
    );
  }

  try {
    await notifySubmitterRejected(
      (existing as Pick<Submission, "submitter_email">).submitter_email,
      (existing as Pick<Submission, "tool_name">).tool_name,
      reason
    );
  } catch (err) {
    console.error("[admin/reject] submitter email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
