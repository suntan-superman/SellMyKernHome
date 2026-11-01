export const ADMIN_COOKIE_NAME = "smkh_admin_access";
export const leadStatuses = ["new", "contacted", "qualified", "appointment", "offer_made", "under_contract", "closed", "lost"];

export function statusLabel(status) {
  return String(status || "").replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}
