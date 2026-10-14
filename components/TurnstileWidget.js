"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

export default function TurnstileWidget({ onToken }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const container = useRef(null), widgetId = useRef(null);
  function renderWidget() {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current !== null) return;
    widgetId.current = window.turnstile.render(container.current, { sitekey: siteKey, callback: onToken, "expired-callback": () => onToken("") });
  }
  useEffect(() => { renderWidget(); return () => { if (widgetId.current !== null && window.turnstile) window.turnstile.remove(widgetId.current); }; }, []);
  if (!siteKey) return process.env.NODE_ENV === "production" ? <p className="field-error">Anti-spam configuration is required before submissions can be enabled.</p> : null;
  return <div><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={renderWidget} /><div ref={container} /></div>;
}

