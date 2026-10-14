import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const { loadEnvConfig } = nextEnv;
loadEnvConfig(projectRoot, true);

const required = [
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY",
  "RESEND_API_KEY", "LEAD_NOTIFICATION_EMAIL", "EMAIL_FROM", "RATE_LIMIT_HMAC_SECRET",
];
const recommended = [
  "NEXT_PUBLIC_SITE_URL", "GNZ_ADMIN_BASE_URL", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY",
];
const missingRequired = required.filter((name) => !process.env[name]?.trim());
const missingRecommended = recommended.filter((name) => !process.env[name]?.trim());
const report = {
  environment: { required: missingRequired.length ? "incomplete" : "complete", missing_required: missingRequired, missing_recommended: missingRecommended },
  supabase: { service_connection: "not_tested", base_schema: "not_tested", seller_migration: "not_tested", anonymous_lead_access: "not_tested", admins: [] },
  resend: { key: process.env.RESEND_API_KEY ? "configured" : "missing", sender_domain: "not_tested", recipient_count: String(process.env.LEAD_NOTIFICATION_EMAIL || "").split(/[;,]/).map((item) => item.trim()).filter(Boolean).length },
};

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
  const clientOptions = { auth: { autoRefreshToken: false, persistSession: false }, realtime: { transport: WebSocket } };
  const service = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, clientOptions);
  const publishable = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, clientOptions);
  const base = await service.from("gnz_leads").select("id", { head: true, count: "exact" });
  report.supabase.service_connection = base.error ? `failed:${base.error.code || "unknown"}` : "ok";
  report.supabase.base_schema = base.error ? "unavailable" : "gnz_leads_present";

  const sellerColumns = await service.from("gnz_leads").select("id,lead_type,source_site,preferred_contact,property_address,property_city,property_zip,property_type,property_condition,occupancy,desired_timing,attribution,consent,assigned_to").limit(0);
  const deliveryTable = await service.from("smkh_notification_logs").select("id").limit(0);
  report.supabase.seller_migration = !sellerColumns.error && !deliveryTable.error ? "present" : "not_present";

  const anonymous = await publishable.from("gnz_leads").select("id").limit(1);
  report.supabase.anonymous_lead_access = anonymous.error ? "denied" : anonymous.data?.length ? "VISIBLE_SECURITY_FAILURE" : "zero_rows_visible";

  for (const suffix of ["", "2"]) {
    const email = process.env[`ADMIN${suffix}`];
    const password = process.env[`ADMIN${suffix}_PW`];
    if (!email || !password) { report.supabase.admins.push({ slot: suffix || "1", auth: "not_configured", membership: "not_tested" }); continue; }
    const authClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, clientOptions);
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    let membership = "not_tested";
    if (data?.user?.id) {
      const lookup = await service.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      membership = lookup.error ? "lookup_failed" : lookup.data ? "authorized" : "missing";
      await authClient.auth.signOut();
    }
    report.supabase.admins.push({ slot: suffix || "1", auth: error ? "failed" : "ok", membership });
  }
}

if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
  const match = process.env.EMAIL_FROM.match(/@([^>\s]+)>?$/);
  try {
    const response = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 401 || response.status === 403) {
      report.resend.sender_domain = "not_checkable_restricted_key";
    } else if (!response.ok) {
      report.resend.sender_domain = `lookup_failed:${response.status}`;
    } else {
      const result = await response.json();
      const domains = result?.data || [];
      const senderDomain = match?.[1]?.toLowerCase();
      report.resend.sender_domain = Array.isArray(domains) && senderDomain && domains.some((item) => item.name?.toLowerCase() === senderDomain && item.status === "verified") ? "verified" : "not_verified_or_not_listed";
    }
  } catch {
    report.resend.sender_domain = "lookup_failed";
  }
}

console.log(JSON.stringify(report, null, 2));
if (missingRequired.length || report.supabase.service_connection.startsWith("failed") || report.supabase.anonymous_lead_access === "VISIBLE_SECURITY_FAILURE") process.exitCode = 1;
