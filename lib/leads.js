import "server-only";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "./supabase";
import { splitName } from "./validation";
import { sendLeadNotification } from "./notifications";

function reference() { return `SMKH-${new Date().toISOString().slice(0,10).replaceAll("-","")}-${randomBytes(3).toString("hex").toUpperCase()}`; }
export async function createSellerLead(data) {
  const client = createServiceClient(); if (!client) throw new Error("Lead storage is not configured.");
  const { firstName, lastName } = splitName(data.name);
  const consentAt = new Date().toISOString();
  const record = { reference: reference(), submission_token: data.submissionToken, source: "seller_web", lead_type: "seller", source_site: "sellmykernhome.com", first_name: firstName, last_name: lastName, company_name: "", phone: data.phone, email: data.email, preferred_contact: data.preferredContact, service: "seller-property", message: data.comments || "Seller property inquiry", property_address: data.propertyAddress, property_city: data.propertyCity, property_zip: data.propertyZip, property_type: data.propertyType, property_condition: data.condition, occupancy: data.occupancy, desired_timing: data.timing, attribution: data.attribution, consent: { consent_type: "first_party_seller_inquiry", privacy_acknowledged: true, privacy_version: data.consentVersion, privacy_notice_sha256: data.consentNoticeHash, privacy_at: consentAt, submission_source: "seller_web", marketing_consent: data.marketingConsent, marketing_notice_version: data.marketingConsentVersion, marketing_notice_sha256: data.marketingConsentNoticeHash, marketing_consent_at: data.marketingConsent ? consentAt : null, external_sharing_consent: false }, status: "new" };
  const { data: lead, error } = await client.from("smkh_leads").insert(record).select("id,reference,submission_token").single();
  if (error?.code === "23505") { const { data: existing } = await client.from("smkh_leads").select("id,reference,submission_token").eq("submission_token", data.submissionToken).maybeSingle(); if (existing) return { lead: existing, duplicate: true, notification: null }; }
  if (error || !lead) { console.error("Seller lead storage failed", { code: error?.code }); throw new Error("Lead could not be stored."); }
  let notification; try { notification = await sendLeadNotification(lead); } catch { notification = { sent: false, reason: "notification_failed" }; }
  return { lead, duplicate: false, notification };
}

