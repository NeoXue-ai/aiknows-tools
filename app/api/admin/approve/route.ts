import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  assertSameOriginRequest,
  authErrorResponse,
  requireAdmin,
} from "@/lib/auth/session";
import { notifySubmitterApproved } from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PricingType, Submission } from "@/lib/supabase/types";

const PRICING_VALUES: PricingType[] = ["free", "freemium", "paid", "enterprise"];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export async function POST(request: NextRequest) {
  try {
    assertSameOriginRequest(request);
    await requireAdmin(request);
  } catch (error) {
    return authErrorResponse(error);
  }

  let body: { submissionId?: unknown };
  try {
    body = (await request.json()) as { submissionId?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const submissionId =
    typeof body.submissionId === "string" ? body.submissionId : null;
  if (!submissionId) {
    return NextResponse.json(
      { error: "submissionId is required" },
      { status: 400 }
    );
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    console.error("[admin/approve] missing env:", err);
    return NextResponse.json(
      { error: "Server is missing Supabase configuration" },
      { status: 500 }
    );
  }

  const { data: submissionData, error: submissionError } = await admin
    .from("submissions")
    .select("*")
    .eq("id", submissionId)
    .single();

  if (submissionError || !submissionData) {
    console.error("[admin/approve] submission lookup failed:", submissionError);
    return NextResponse.json(
      { error: "Submission not found" },
      { status: 404 }
    );
  }

  const submission = submissionData as Submission;

  if (submission.status === "approved") {
    return NextResponse.json(
      { error: "Submission has already been approved" },
      { status: 409 }
    );
  }

  const baseSlug = slugify(submission.tool_name) || "tool";
  const slug = `${baseSlug}-${shortId()}`;

  const pricing: PricingType | null =
    submission.pricing_type && (PRICING_VALUES as string[]).includes(submission.pricing_type)
      ? (submission.pricing_type as PricingType)
      : null;

  const category = submission.category ?? "writing-content";

  const { data: toolData, error: toolError } = await admin
    .from("tools")
    .insert({
      slug,
      name: submission.tool_name,
      tagline: null,
      description: submission.description,
      url: submission.tool_url,
      logo_url: submission.logo_url,
      screenshot_url: submission.screenshot_url,
      primary_category: category,
      tags: [],
      pricing_type: pricing,
      pricing_detail: null,
      is_featured: false,
      is_verified: false,
      status: "approved",
      submitter_email: submission.submitter_email,
      submitted_at: submission.created_at,
      published_at: new Date().toISOString(),
    })
    .select("id, slug")
    .single();

  if (toolError || !toolData) {
    console.error("[admin/approve] tool insert failed:", toolError);
    return NextResponse.json(
      { error: "Could not create tool from submission" },
      { status: 500 }
    );
  }

  const { error: updateError } = await admin
    .from("submissions")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  if (updateError) {
    console.error("[admin/approve] submission update failed:", updateError);
  }

  try {
    revalidateTag("tools", "max");
    revalidatePath("/latest");
    revalidatePath("/");
    revalidatePath("/tools");
  } catch (err) {
    console.error("[admin/approve] revalidate failed:", err);
  }

  try {
    await notifySubmitterApproved(
      submission.submitter_email,
      submission.tool_name,
      toolData.slug as string
    );
  } catch (err) {
    console.error("[admin/approve] submitter email failed:", err);
  }

  return NextResponse.json({
    ok: true,
    toolId: toolData.id,
    slug: toolData.slug,
  });
}
