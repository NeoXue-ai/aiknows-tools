import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyAdminOfSubmission } from "@/lib/email";
import type { PricingType, Submission } from "@/lib/supabase/types";

const PRICING_VALUES: PricingType[] = ["free", "freemium", "paid", "enterprise"];

interface SubmitPayload {
  tool_name?: unknown;
  tool_url?: unknown;
  description?: unknown;
  category?: unknown;
  pricing_type?: unknown;
  submitter_email?: unknown;
  logo_url?: unknown;
  screenshot_url?: unknown;
}

function asString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: SubmitPayload;
  try {
    body = (await request.json()) as SubmitPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const toolName = asString(body.tool_name, 100);
  const toolUrl = asString(body.tool_url, 500);
  const description = asString(body.description, 2000);
  const category = asString(body.category, 100);
  const submitterEmail = asString(body.submitter_email, 320);
  const pricingTypeRaw = asString(body.pricing_type, 20);
  const logoUrl = asString(body.logo_url, 500);
  const screenshotUrl = asString(body.screenshot_url, 500);

  if (!toolName) {
    return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
  }
  if (!toolUrl || !isValidUrl(toolUrl)) {
    return NextResponse.json(
      { error: "A valid tool URL is required" },
      { status: 400 }
    );
  }
  if (!description || description.length < 50 || description.length > 500) {
    return NextResponse.json(
      { error: "Description must be between 50 and 500 characters" },
      { status: 400 }
    );
  }
  if (!category) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }
  if (!submitterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 }
    );
  }
  const pricingType: PricingType =
    pricingTypeRaw && (PRICING_VALUES as string[]).includes(pricingTypeRaw)
      ? (pricingTypeRaw as PricingType)
      : "freemium";

  if (logoUrl && !isValidUrl(logoUrl)) {
    return NextResponse.json({ error: "Logo URL must be a valid URL" }, { status: 400 });
  }
  if (screenshotUrl && !isValidUrl(screenshotUrl)) {
    return NextResponse.json(
      { error: "Screenshot URL must be a valid URL" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      tool_name: toolName,
      tool_url: toolUrl,
      description,
      category,
      pricing_type: pricingType,
      submitter_email: submitterEmail,
      logo_url: logoUrl,
      screenshot_url: screenshotUrl,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[submit] insert failed:", error);
    return NextResponse.json(
      { error: "Could not save submission. Please try again." },
      { status: 500 }
    );
  }

  const submission = data as Pick<Submission, "id">;

  try {
    await notifyAdminOfSubmission({
      toolName,
      toolUrl,
      submitterEmail,
      description,
      category,
      submissionId: submission.id,
    });
  } catch (err) {
    console.error("[submit] admin notification failed:", err);
  }

  return NextResponse.json({ ok: true, id: submission.id });
}
