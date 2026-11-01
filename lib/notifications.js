import "server-only";
import { Resend } from "resend";
import { createServiceClient } from "./supabase";
import { isEmailEnabled, isStagingEnvironment } from "./runtime";

function recipients(value) { return [...new Set(String(value || "").split(/[;,]/).map((item) => item.trim()).filter((item) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(item)))]; }
async function logNotification(leadId, status, providerId = "", errorCode = "") { const client = createServiceClient(); if (client) await client.from("smkh_notification_logs").insert({ lead_id: leadId, channel: "email", status, provider_id: providerId || null, error_code: errorCode || null }); }

export async function sendLeadNotification(lead) {
  const staging = isStagingEnvironment();
  if (!isEmailEnabled()) { await logNotification(lead.id, "disabled", "", "staging_email_disabled"); return { sent: false, reason: "disabled" }; }
  const to = recipients(staging ? process.env.STAGING_LEAD_NOTIFICATION_EMAIL : process.env.LEAD_NOTIFICATION_EMAIL);
  const from = (staging ? process.env.STAGING_EMAIL_FROM : process.env.EMAIL_FROM)?.trim();
  const apiKey = (staging ? process.env.STAGING_RESEND_API_KEY : process.env.RESEND_API_KEY)?.trim();
  if (!to.length || !from || !apiKey) { await logNotification(lead.id, "not_configured", "", "missing_configuration"); return { sent: false, reason: "not_configured" }; }
  const adminBase = (staging ? process.env.STAGING_ADMIN_BASE_URL : process.env.GNZ_ADMIN_BASE_URL)?.trim();
  const adminUrl = adminBase ? new URL(`/admin/leads/${lead.id}`, adminBase).toString() : "";
  const adminLink = staging
    ? (adminUrl ? `<p><a href="${adminUrl}">Open the secure SMKH demo lead record</a></p>` : "<p>Sign in to the authorized SMKH demo admin panel to review it.</p>")
    : (adminUrl ? `<p><a href="${adminUrl}">Open the secure GNZ lead record</a></p>` : "<p>Sign in to the GNZ admin panel to review it.</p>");
  try {
    const resend = new Resend(apiKey);
    const replyTo = (staging ? process.env.STAGING_EMAIL_REPLY_TO : process.env.EMAIL_REPLY_TO)?.trim();
    const result = await resend.emails.send({ from, ...(replyTo ? { replyTo } : {}), to: to.length === 1 ? to[0] : to,
      subject: `New Sell My Kern Home inquiry ${lead.reference}`,
      html: `<h1>New seller inquiry</h1><p><strong>Reference:</strong> ${lead.reference}</p><p>A new Sell My Kern Home inquiry is ready for authorized review.</p>${adminLink}<p>This notification intentionally excludes property and contact details.</p>` });
    if (result?.error) { await logNotification(lead.id, "failed", "", "provider_rejected"); return { sent: false, reason: "provider_rejected" }; }
    await logNotification(lead.id, "sent", result?.data?.id || ""); return { sent: true };
  } catch { await logNotification(lead.id, "failed", "", "provider_unavailable"); return { sent: false, reason: "provider_unavailable" }; }
}

