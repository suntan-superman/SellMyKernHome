"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

export default function Analytics() {
  useEffect(() => {
    const handler = (event) => {
      const link = event.target.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const eventName = href.startsWith("tel:") ? "phone_click" : href.startsWith("mailto:") ? "email_click" : link.dataset.analyticsEvent;
      if (eventName) track(eventName, { location: link.dataset.analyticsLocation || "content", destination: href.startsWith("/") ? href.split("?")[0] : undefined });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  return null;
}

