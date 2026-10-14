"use client";

import { useEffect } from "react";

export default function Analytics() {
  useEffect(() => {
    const handler = (event) => {
      const link = event.target.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const eventName = href.startsWith("tel:") ? "call_click" : href.startsWith("mailto:") || href === "/contact" ? "contact_click" : null;
      if (eventName) window.gtag?.("event", eventName);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return null;
}

