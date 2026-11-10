import "server-only";
import { cleanText } from "./validation";
import { leadStatuses } from "./admin-shared";

export { leadStatuses, statusLabel } from "./admin-shared";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function listAdminLeads(context, requestedStatus = "") {
  const status = leadStatuses.includes(requestedStatus) ? requestedStatus : "";
  let query = context.client
    .from("smkh_leads")
    .select("id,reference,first_name,last_name,property_address,property_city,property_zip,preferred_contact,status,follow_up_at,created_at,archived_at")
    .order("created_at", { ascending: false })
    .limit(250);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(`Lead list unavailable: ${error.code || "query_failed"}`);
  return { leads: data || [], status };
}

export async function getAdminLead(context, leadId) {
  if (!UUID.test(String(leadId || ""))) return null;
  const { data: lead, error } = await context.client
    .from("smkh_leads")
    .select("id,reference,source,source_site,created_at,updated_at,first_name,last_name,phone,email,preferred_contact,message,property_address,property_city,property_zip,property_type,property_condition,occupancy,desired_timing,attribution,consent,status,internal_notes,follow_up_at,last_contacted_at,archived_at,legacy_status")
    .eq("id", leadId)
    .maybeSingle();
  if (error) throw new Error(`Lead unavailable: ${error.code || "query_failed"}`);
  if (!lead) return null;

  const [{ data: events, error: eventError }, { data: notifications, error: notificationError }] = await Promise.all([
    context.client.from("smkh_lead_events").select("id,action,actor_id,actor_kind,before_state,after_state,created_at").eq("lead_id", leadId).order("created_at", { ascending: false }).limit(100),
    context.client.from("smkh_notifications").select("id,channel,status,error_code,attempted_at").eq("lead_id", leadId).order("attempted_at", { ascending: false }).limit(50),
  ]);
  if (eventError) throw new Error(`Audit history unavailable: ${eventError.code || "query_failed"}`);
  if (notificationError) throw new Error(`Notification history unavailable: ${notificationError.code || "query_failed"}`);
  return { lead, events: events || [], notifications: notifications || [] };
}

export async function listPrivacyRequests(context) {
  const { data, error } = await context.client
    .from("smkh_privacy_requests")
    .select("id,request_reference,request_type,email,phone,status,suppression_active,matched_lead_count,prior_disclosure_follow_up_required,requested_at")
    .order("requested_at", { ascending: false })
    .limit(250);
  if (error) throw new Error(`Privacy request list unavailable: ${error.code || "query_failed"}`);
  return data || [];
}

function cleanTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function validateLeadUpdate(input) {
  const status = cleanText(input?.status, 40);
  const internalNotes = cleanText(input?.internalNotes, 10000);
  const followUpAt = cleanTimestamp(input?.followUpAt);
  const lastContactedAt = cleanTimestamp(input?.lastContactedAt);
  const errors = {};
  if (!leadStatuses.includes(status)) errors.status = "Choose a valid status.";
  if (followUpAt === undefined) errors.followUpAt = "Enter a valid follow-up date.";
  if (lastContactedAt === undefined) errors.lastContactedAt = "Enter a valid contact date.";
  return { valid: Object.keys(errors).length === 0, data: { status, internalNotes, followUpAt, lastContactedAt }, errors };
}

export async function updateAdminLead(context, leadId, input) {
  if (!UUID.test(String(leadId || ""))) return { ok: false, status: 404, message: "Lead not found." };
  if (!["owner", "admin", "operator"].includes(context.role)) return { ok: false, status: 403, message: "This account has read-only access." };
  const validation = validateLeadUpdate(input);
  if (!validation.valid) return { ok: false, status: 422, message: "Review the highlighted values.", errors: validation.errors };
  const { data, error } = await context.client.rpc("smkh_update_lead", {
    p_lead_id: leadId,
    p_status: validation.data.status,
    p_internal_notes: validation.data.internalNotes,
    p_follow_up_at: validation.data.followUpAt,
    p_last_contacted_at: validation.data.lastContactedAt,
  });
  if (error) return { ok: false, status: error.code === "42501" ? 403 : 500, message: "The lead could not be updated." };
  if (!data?.length) return { ok: false, status: 404, message: "Lead not found." };
  return { ok: true };
}
