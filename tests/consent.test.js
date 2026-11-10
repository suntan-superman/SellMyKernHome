import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  MARKETING_NOTICE_SHA256,
  MARKETING_NOTICE_TEXT,
  MARKETING_NOTICE_VERSION,
  PRIVACY_REQUEST_NOTICE_SHA256,
  PRIVACY_REQUEST_NOTICE_TEXT,
  PRIVACY_REQUEST_NOTICE_VERSION,
  PRIVACY_NOTICE_SHA256,
  PRIVACY_NOTICE_TEXT,
  PRIVACY_NOTICE_VERSION,
  SHARING_NOTICE_SHA256,
  SHARING_NOTICE_TEXT,
  SHARING_NOTICE_VERSION,
} from "../lib/consent-notices.js";

const sha256 = (value) => createHash("sha256").update(value, "utf8").digest("hex");

test("immutable consent notice hashes match the exact source-controlled text", () => {
  assert.equal(sha256(PRIVACY_NOTICE_TEXT), PRIVACY_NOTICE_SHA256);
  assert.equal(sha256(SHARING_NOTICE_TEXT), SHARING_NOTICE_SHA256);
  assert.equal(sha256(MARKETING_NOTICE_TEXT), MARKETING_NOTICE_SHA256);
  assert.equal(sha256(PRIVACY_REQUEST_NOTICE_TEXT), PRIVACY_REQUEST_NOTICE_SHA256);
  assert.match(PRIVACY_NOTICE_VERSION, /^smkh-privacy-notice-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.match(MARKETING_NOTICE_VERSION, /^smkh-automated-marketing-consent-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.match(SHARING_NOTICE_VERSION, /^smkh-external-sharing-consent-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.match(PRIVACY_REQUEST_NOTICE_VERSION, /^smkh-do-not-sell-share-request-\d{4}-\d{2}-\d{2}-v\d+$/);
  assert.doesNotMatch(`${PRIVACY_NOTICE_VERSION}\n${SHARING_NOTICE_VERSION}\n${MARKETING_NOTICE_VERSION}\n${PRIVACY_REQUEST_NOTICE_VERSION}`, /draft/i);
});

test("current notices separate first-party intake, sharing, automated marketing, and opt-out", () => {
  assert.match(PRIVACY_NOTICE_TEXT, /technology and lead-generation service/);
  assert.match(PRIVACY_NOTICE_TEXT, /does not authorize external sharing or automated marketing/);
  assert.match(SHARING_NOTICE_TEXT, /flat fee per contact/);
  assert.match(SHARING_NOTICE_TEXT, /does not authorize automated marketing/);
  assert.match(MARKETING_NOTICE_TEXT, /including by automated, prerecorded, or artificial-voice means/);
  assert.match(MARKETING_NOTICE_TEXT, /does not authorize sharing my information with outside parties/);
  assert.match(PRIVACY_REQUEST_NOTICE_TEXT, /suppress future sale or sharing/);
});
