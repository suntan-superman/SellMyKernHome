import {
  MARKETING_NOTICE_SHA256,
  MARKETING_NOTICE_VERSION,
  PRIVACY_REQUEST_NOTICE_SHA256,
  PRIVACY_REQUEST_NOTICE_VERSION,
  PRIVACY_NOTICE_SHA256,
  PRIVACY_NOTICE_VERSION,
  SHARING_NOTICE_SHA256,
  SHARING_NOTICE_VERSION,
} from "./consent-notices.js";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ZIP = /^\d{5}(-\d{4})?$/;
const allowed = {
  preferredContact: new Set(["email", "phone"]),
  propertyType: new Set(["", "Single-family home", "Condo or townhome", "Multi-unit property", "Manufactured home", "Other"]),
  condition: new Set(["", "Move-in ready", "Minor updates needed", "Significant repairs needed", "Unsure"]),
  occupancy: new Set(["", "Owner occupied", "Tenant occupied", "Vacant", "Other"]),
  timing: new Set(["", "Exploring options", "Within 30 days", "1–3 months", "3+ months", "Unsure"]),
};

export function cleanText(value, max = 500) {
  // The explicit control-code range is intentional input sanitization.
  // eslint-disable-next-line no-control-regex
  return String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}
export function formatPhoneNumber(value) {
  let digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length > 10 && digits.startsWith("1")) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
export function normalizePhone(value) {
  const cleaned = cleanText(value, 30).replace(/[^\d+()\- .]/g, "");
  const digits = cleaned.replace(/\D/g, "");
  return digits.length === 10 || (digits.length === 11 && digits.startsWith("1")) ? formatPhoneNumber(cleaned) : cleaned;
}
export function isValidPhone(value) { const count = String(value || "").replace(/\D/g, "").length; return count >= 10 && count <= 15; }
function safeUrl(value, max = 500) { try { const url = new URL(cleanText(value, max)); return ["http:", "https:"].includes(url.protocol) ? url.toString().slice(0, max) : ""; } catch { return ""; } }

export function validateSellerLead(input) {
  const source = input && typeof input === "object" ? input : {};
  const data = {
    submissionToken: cleanText(source.submissionToken, 36),
    propertyAddress: cleanText(source.propertyAddress, 240), propertyCity: cleanText(source.propertyCity, 100), propertyZip: cleanText(source.propertyZip, 10),
    name: cleanText(source.name, 160), preferredContact: cleanText(source.preferredContact, 10), email: cleanText(source.email, 160).toLowerCase(), phone: normalizePhone(source.phone),
    privacyAcknowledged: source.privacyAcknowledged === true, sharingConsent: source.sharingConsent === true, marketingConsent: source.marketingConsent === true,
    propertyType: cleanText(source.propertyType, 80), condition: cleanText(source.condition, 80), occupancy: cleanText(source.occupancy, 80), timing: cleanText(source.timing, 80), comments: cleanText(source.comments, 2000),
    website: cleanText(source.website, 200), startedAt: Number(source.startedAt),
    consentVersion: cleanText(source.consentVersion, 80), consentNoticeHash: cleanText(source.consentNoticeHash, 64).toLowerCase(),
    sharingConsentVersion: cleanText(source.sharingConsentVersion, 80), sharingConsentNoticeHash: cleanText(source.sharingConsentNoticeHash, 64).toLowerCase(),
    marketingConsentVersion: cleanText(source.marketingConsentVersion, 80), marketingConsentNoticeHash: cleanText(source.marketingConsentNoticeHash, 64).toLowerCase(),
    attribution: { landing_url: safeUrl(source.landingUrl), referrer: safeUrl(source.referrer), utm_source: cleanText(source.utmSource, 100), utm_medium: cleanText(source.utmMedium, 100), utm_campaign: cleanText(source.utmCampaign, 120), utm_content: cleanText(source.utmContent, 120), utm_term: cleanText(source.utmTerm, 120) },
  };
  const errors = {};
  if (!UUID.test(data.submissionToken)) errors.submissionToken = "Refresh the page and try again.";
  if (data.propertyAddress.length < 4) errors.propertyAddress = "Enter the property street address.";
  if (data.propertyCity.length < 2) errors.propertyCity = "Enter the property city.";
  if (!ZIP.test(data.propertyZip)) errors.propertyZip = "Enter a valid ZIP code.";
  if (data.name.length < 2) errors.name = "Enter your name.";
  if (!allowed.preferredContact.has(data.preferredContact)) errors.preferredContact = "Choose email or phone.";
  if (data.preferredContact === "email" && !EMAIL.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.preferredContact === "phone" && !isValidPhone(data.phone)) errors.phone = "Enter a valid phone number.";
  for (const key of ["propertyType", "condition", "occupancy", "timing"]) if (!allowed[key].has(data[key])) errors[key] = "Choose a valid option.";
  if (!data.privacyAcknowledged) errors.privacyAcknowledged = "Please acknowledge the privacy notice.";
  if (data.consentVersion !== PRIVACY_NOTICE_VERSION || data.consentNoticeHash !== PRIVACY_NOTICE_SHA256) errors.privacyAcknowledged = "The privacy notice changed. Refresh the page and review it again.";
  if (data.sharingConsentVersion !== SHARING_NOTICE_VERSION || data.sharingConsentNoticeHash !== SHARING_NOTICE_SHA256) errors.sharingConsent = "The external-sharing notice changed. Refresh the page and review it again.";
  if (data.marketingConsentVersion !== MARKETING_NOTICE_VERSION || data.marketingConsentNoticeHash !== MARKETING_NOTICE_SHA256) errors.marketingConsent = "The optional marketing notice changed. Refresh the page and review it again.";
  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function validatePrivacyRequest(input) {
  const source = input && typeof input === "object" ? input : {};
  const data = {
    requestToken: cleanText(source.requestToken, 36),
    email: cleanText(source.email, 160).toLowerCase(),
    phone: normalizePhone(source.phone),
    acknowledged: source.acknowledged === true,
    noticeVersion: cleanText(source.noticeVersion, 80),
    noticeHash: cleanText(source.noticeHash, 64).toLowerCase(),
    website: cleanText(source.website, 200),
    startedAt: Number(source.startedAt),
  };
  const errors = {};
  if (!UUID.test(data.requestToken)) errors.requestToken = "Refresh the page and try again.";
  if (!data.email && !data.phone) errors.contact = "Enter the email address or phone number associated with your inquiry.";
  if (data.email && !EMAIL.test(data.email)) errors.email = "Enter a valid email address.";
  if (data.phone && !isValidPhone(data.phone)) errors.phone = "Enter a valid phone number.";
  if (!data.acknowledged) errors.acknowledged = "Confirm the request before submitting.";
  if (data.noticeVersion !== PRIVACY_REQUEST_NOTICE_VERSION || data.noticeHash !== PRIVACY_REQUEST_NOTICE_SHA256) errors.acknowledged = "The privacy request notice changed. Refresh the page and review it again.";
  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function passesHoneypot(data, now = Date.now()) {
  if (data.website) return false;
  return Number.isFinite(data.startedAt) && now - data.startedAt >= 1500 && now - data.startedAt <= 24 * 60 * 60 * 1000;
}

export function splitName(name) { const pieces = cleanText(name, 160).split(/\s+/).filter(Boolean); return { firstName: pieces.shift() || "", lastName: pieces.join(" ") }; }

