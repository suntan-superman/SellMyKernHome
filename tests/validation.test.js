import test from "node:test";
import assert from "node:assert/strict";
import { formatPhoneNumber, passesHoneypot, splitName, validateSellerLead } from "../lib/validation.js";

function valid(overrides = {}) {
  return { submissionToken: "8ed0fe14-00f0-4bf0-95b5-d3fd34dd1030", propertyAddress: "123 Test Street", propertyCity: "Bakersfield", propertyZip: "93301", name: "Synthetic Seller", preferredContact: "email", email: "seller@example.test", phone: "", privacyAcknowledged: true, marketingConsent: false, propertyType: "Single-family home", condition: "Unsure", occupancy: "Vacant", timing: "Exploring options", comments: "Synthetic test data only.", website: "", startedAt: Date.now() - 5000, consentVersion: "test-v1", landingUrl: "https://example.test/contact", ...overrides };
}

test("accepts a valid seller inquiry and preserves separate consent", () => {
  const result = validateSellerLead(valid());
  assert.equal(result.valid, true);
  assert.equal(result.data.marketingConsent, false);
  assert.equal(result.data.attribution.landing_url, "https://example.test/contact");
});
test("requires the selected contact method", () => {
  const email = validateSellerLead(valid({ email: "bad" })); assert.equal(email.valid, false); assert.ok(email.errors.email);
  const phone = validateSellerLead(valid({ preferredContact: "phone", phone: "123" })); assert.equal(phone.valid, false); assert.ok(phone.errors.phone);
});
test("formats US phone input consistently for display and storage", () => {
  assert.equal(formatPhoneNumber("6613451154"), "(661) 345-1154");
  assert.equal(formatPhoneNumber("+1 661 345 1154"), "(661) 345-1154");
  assert.equal(formatPhoneNumber("66134"), "(661) 34");
  const result = validateSellerLead(valid({ preferredContact: "phone", phone: "6613451154", email: "" }));
  assert.equal(result.valid, true);
  assert.equal(result.data.phone, "(661) 345-1154");
});
test("rejects unknown select values and missing privacy acknowledgement", () => {
  const result = validateSellerLead(valid({ condition: "Made up", privacyAcknowledged: false })); assert.ok(result.errors.condition); assert.ok(result.errors.privacyAcknowledged);
});
test("honeypot rejects bots, instant posts, and stale forms", () => {
  const now = Date.now(); assert.equal(passesHoneypot({ website: "spam", startedAt: now - 5000 }, now), false); assert.equal(passesHoneypot({ website: "", startedAt: now - 100 }, now), false); assert.equal(passesHoneypot({ website: "", startedAt: now - 25 * 60 * 60 * 1000 }, now), false); assert.equal(passesHoneypot({ website: "", startedAt: now - 5000 }, now), true);
});
test("splits a display name for independent SMKH storage", () => assert.deepEqual(splitName("Synthetic Test Seller"), { firstName: "Synthetic", lastName: "Test Seller" }));

