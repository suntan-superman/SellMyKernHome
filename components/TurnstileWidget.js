"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

export default function TurnstileWidget({ onToken, onStatus = () => {}, resetSignal = 0 }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = useRef(null), widgetId = useRef(null);
  const acceptToken = (token) => { onToken(token); onStatus(""); };
  const rejectToken = (message) => { onToken(""); onStatus(message); };
  function renderWidget() {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      callback: acceptToken,
      "error-callback": () => rejectToken("The anti-spam check could not load. Please refresh the page and try again."),
      "expired-callback": () => rejectToken("The anti-spam check expired. Please complete it again."),
      "timeout-callback": () => rejectToken("The anti-spam check timed out. Please complete it again."),
    });
  }
  useEffect(() => { renderWidget(); return () => { if (widgetId.current !== null && window.turnstile) window.turnstile.remove(widgetId.current); }; }, []);
  useEffect(() => {
    if (resetSignal > 0 && widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onToken("");
    }
  }, [resetSignal]);
  if (!siteKey) return process.env.NODE_ENV === "production" ? <p className="field-error">Anti-spam configuration is required before submissions can be enabled.</p> : null;
  return <div role="group" aria-label="Anti-spam verification"><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderWidget} /><div ref={container} /></div>;
}

