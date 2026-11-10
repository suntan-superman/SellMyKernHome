import "server-only";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "./supabase";
import { hashIdentifier } from "./rateLimit";

function reference() {
  return `SMKH-PRIV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export function sharingIdentityHashes({ email = "", phone = "" }) {
  return [
    email ? hashIdentifier(`sharing:email:${email.trim().toLowerCase()}`) : "",
    phone ? hashIdentifier(`sharing:phone:${phone.replace(/\D/g, "")}`) : "",
  ].filter(Boolean);
}

export async function isSharingSuppressed(client, contact) {
  const hashes = sharingIdentityHashes(contact);
  if (!hashes.length) return false;
  const { data, error } = await client.rpc("smkh_is_sharing_suppressed", {
    p_identifier_hashes: hashes,
  });
  if (error) return true;
  return data === true;
}

export async function createPrivacyRequest(data) {
  const client = createServiceClient();
  if (!client) throw new Error("Privacy request storage is not configured.");
  const requestReference = reference();
  const { data: result, error } = await client.rpc("smkh_create_privacy_request", {
    p_request_token: data.requestToken,
    p_request_reference: requestReference,
    p_request_type: "do_not_sell_or_share",
    p_email: data.email,
    p_phone: data.phone,
    p_identifier_hashes: sharingIdentityHashes(data),
    p_notice_version: data.noticeVersion,
    p_notice_sha256: data.noticeHash,
  });
  if (error) {
    console.error("Privacy request storage failed", { code: error.code });
    throw new Error("Privacy request could not be stored.");
  }
  return {
    reference: result?.[0]?.request_reference || requestReference,
    duplicate: result?.[0]?.duplicate === true,
  };
}
