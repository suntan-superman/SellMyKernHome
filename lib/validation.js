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
export function normalizePhone(value) { return cleanText(value, 30).replace(/[^\d+()\- .]/g, ""); }
export function isValidPhone(value) { const count = String(value || "").replace(/\D/g, "").length; return count >= 10 && count <= 15; }
function safeUrl(value, max = 500) { try { const url = new URL(cleanText(value, max)); return ["http:", "https:"].includes(url.protocol) ? url.toString().slice(0, max) : ""; } catch { return ""; } }

export function validateSellerLead(input) {
  const source = input && typeof input === "object" ? input : {};
  const data = {
    submissionToken: cleanText(source.submissionToken, 36),
    propertyAddress: cleanText(source.propertyAddress, 240), propertyCity: cleanText(source.propertyCity, 100), propertyZip: cleanText(source.propertyZip, 10),
    name: cleanText(source.name, 160), preferredContact: cleanText(source.preferredContact, 10), email: cleanText(source.email, 160).toLowerCase(), phone: normalizePhone(source.phone),
    privacyAcknowledged: source.privacyAcknowledged === true, marketingConsent: source.marketingConsent === true,
    propertyType: cleanText(source.propertyType, 80), condition: cleanText(source.condition, 80), occupancy: cleanText(source.occupancy, 80), timing: cleanText(source.timing, 80), comments: cleanText(source.comments, 2000),
    website: cleanText(source.website, 200), startedAt: Number(source.startedAt), consentVersion: cleanText(source.consentVersion, 60),
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
  if (!data.consentVersion) errors.privacyAcknowledged = "Consent text is unavailable. Refresh and try again.";
  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function passesHoneypot(data, now = Date.now()) {
  if (data.website) return false;
  return Number.isFinite(data.startedAt) && now - data.startedAt >= 1500 && now - data.startedAt <= 24 * 60 * 60 * 1000;
}

export function splitName(name) { const pieces = cleanText(name, 160).split(/\s+/).filter(Boolean); return { firstName: pieces.shift() || "", lastName: pieces.join(" ") }; }

