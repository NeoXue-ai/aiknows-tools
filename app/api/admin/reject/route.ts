import { NextResponse, type NextRequest } from "next/server";
import {
  assertSameOriginRequest,
  authErrorResponse,
  requireAdmin,
} from "@/lib/auth/session";
import { notifySubmitterRejected } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Submission } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest(request);
    await requireAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
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
    admin = createAdminClient();
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
