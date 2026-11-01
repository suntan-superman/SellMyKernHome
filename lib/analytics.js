const allowedEvents = new Set(["phone_click", "email_click", "primary_cta_click", "seller_form_start", "seller_form_validation_error", "form_step", "seller_form_submit_success", "generate_lead"]);
const allowedParameters = new Set(["location", "destination", "form", "step", "error_count", "source"]);

export function track(eventName, params = {}) {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem("smkh_analytics_consent") !== "granted" || !allowedEvents.has(eventName)) return;
  const safeParams = Object.fromEntries(Object.entries(params).filter(([key, value]) => allowedParameters.has(key) && ["string", "number", "boolean"].includes(typeof value)));
  window.gtag?.("event", eventName, safeParams);
}

