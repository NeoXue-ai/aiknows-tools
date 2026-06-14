import { Resend } from "resend";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  ok: boolean;
  dev?: boolean;
  id?: string;
  error?: string;
}

export interface SubmissionNotificationParams {
  toolName: string;
  toolUrl: string;
  submitterEmail: string;
  description: string;
  category: string | null;
  submissionId: string;
}

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@aiknows.tools";
const adminEmail = process.env.RESEND_TO_ADMIN ?? "lonnie@aiknows.tools";

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  if (!resend) {
    console.log("[email] Resend not configured, skipping send:", {
      to: params.to,
      subject: params.subject,
    });
    return { ok: true, dev: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      console.error("[email] Resend returned error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email] Send failed:", message);
    return { ok: false, error: message };
  }
}

export async function notifyAdminOfSubmission(
  params: SubmissionNotificationParams
): Promise<SendEmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const reviewUrl = `${siteUrl}/admin/submissions/${params.submissionId}`;

  const subject = `New tool submission: ${params.toolName}`;
  const html = `
    <h2>New tool submission</h2>
    <p><strong>${escapeHtml(params.toolName)}</strong> was just submitted to aiknows.tools.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><strong>URL</strong></td><td><a href="${escapeHtml(params.toolUrl)}">${escapeHtml(params.toolUrl)}</a></td></tr>
      <tr><td><strong>Submitter</strong></td><td>${escapeHtml(params.submitterEmail)}</td></tr>
      <tr><td><strong>Category</strong></td><td>${escapeHtml(params.category ?? "(none)")}</td></tr>
      <tr><td><strong>Description</strong></td><td>${escapeHtml(params.description)}</td></tr>
    </table>
    <p><a href="${reviewUrl}">Review this submission →</a></p>
  `;
  const text =
    `New tool submission: ${params.toolName}\n` +
    `URL: ${params.toolUrl}\n` +
    `Submitter: ${params.submitterEmail}\n` +
    `Category: ${params.category ?? "(none)"}\n` +
    `Description: ${params.description}\n\n` +
    `Review: ${reviewUrl}\n`;

  return sendEmail({ to: adminEmail, subject, html, text });
}

export async function notifySubmitterApproved(
  submitterEmail: string,
  toolName: string,
  toolSlug: string
): Promise<SendEmailResult> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const toolUrl = `${siteUrl}/tools/${toolSlug}`;
  const subject = `Your tool ${toolName} is live on aiknows.tools`;
  const html = `
    <h2>You're in!</h2>
    <p>Your tool <strong>${escapeHtml(toolName)}</strong> has been approved and is now listed on aiknows.tools.</p>
    <p><a href="${toolUrl}">View your listing →</a></p>
    <p>Thanks for submitting — we hope it drives some discovery your way.</p>
  `;
  const text =
    `Your tool ${toolName} is now live on aiknows.tools.\n` +
    `View: ${toolUrl}\n`;

  return sendEmail({ to: submitterEmail, subject, html, text });
}

export async function notifySubmitterRejected(
  submitterEmail: string,
  toolName: string,
  reason: string
): Promise<SendEmailResult> {
  const subject = `Update on your aiknows.tools submission: ${toolName}`;
  const html = `
    <h2>Thanks for submitting ${escapeHtml(toolName)}</h2>
    <p>Unfortunately we're not able to list this tool on aiknows.tools right now.</p>
    <p><strong>Reason:</strong> ${escapeHtml(reason)}</p>
    <p>If you think this is a mistake, just reply to this email and we'll take another look.</p>
  `;
  const text =
    `Thanks for submitting ${toolName}.\n` +
    `Unfortunately we're not able to list it on aiknows.tools right now.\n` +
    `Reason: ${reason}\n`;

  return sendEmail({ to: submitterEmail, subject, html, text });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
