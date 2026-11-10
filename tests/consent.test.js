import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  MARKETING_NOTICE_SHA256,
  MARKETING_NOTICE_TEXT,
  MARKETING_NOTICE_VERSION,
  PRIVACY_NOTICE_SHA256,
  PRIVACY_NOTICE_TEXT,
  PRIVACY_NOTICE_VERSION,
} from "../lib/consent-notices.js";

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

test("immutable consent notice hashes match the exact source-controlled text", () => {
  assert.equal(sha256(PRIVACY_NOTICE_TEXT), PRIVACY_NOTICE_SHA256);
  assert.equal(sha256(MARKETING_NOTICE_TEXT), MARKETING_NOTICE_SHA256);
  assert.match(PRIVACY_NOTICE_VERSION, /^smkh-privacy-notice-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.match(MARKETING_NOTICE_VERSION, /^smkh-marketing-consent-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.doesNotMatch(`${PRIVACY_NOTICE_VERSION}\n${MARKETING_NOTICE_VERSION}`, /draft/i);
});

test("current notices limit the service role and do not authorize external sharing or automated marketing", () => {
  assert.match(PRIVACY_NOTICE_TEXT, /lead-generation service operated by Workside Software/);
  assert.match(PRIVACY_NOTICE_TEXT, /not currently shared with independent real estate professionals or property buyers/);
  assert.match(MARKETING_NOTICE_TEXT, /does not authorize automated, prerecorded, or artificial-voice marketing/);
  assert.match(MARKETING_NOTICE_TEXT, /does not authorize sharing my information with outside parties/);
});
