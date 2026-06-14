import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { notifySubmitterApproved } from "@/lib/email";
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
    admin = getAdminClient();
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
