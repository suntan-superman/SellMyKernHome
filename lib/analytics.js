export function track(eventName, params = {}) {
  if (typeof window === "undefined") return;
  const safeParams = Object.fromEntries(Object.entries(params).filter(([key]) => !/(name|email|phone|address|notes|comment)/i.test(key)));
  window.gtag?.("event", eventName, safeParams);
}

