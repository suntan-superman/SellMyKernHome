"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/analytics";

const consentKey = "smkh_analytics_consent";

function ensureGtag() {
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
}

function defaultConsent() {
  ensureGtag();
  if (window.__smkhConsentDefaulted) return;
  window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", wait_for_update: 500 });
  window.__smkhConsentDefaulted = true;
}

function updateConsent(value) {
  defaultConsent();
  window.gtag("consent", "update", { analytics_storage: value === "granted" ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
}

function setCollectionDisabled(measurementId, disabled) {
  window[`ga-disable-${measurementId}`] = disabled;
}

function clearAnalyticsCookies() {
  document.cookie.split(";").map((item) => item.trim().split("=")[0]).filter((name) => /^_ga(?:_|$)/.test(name)).forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${window.location.hostname}; SameSite=Lax`;
  });
}

function isExcludedPath(pathname) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function Analytics({ measurementId }) {
  const pathname = usePathname();
  const excluded = isExcludedPath(pathname || "");
  const [consent, setConsent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) return;
    if (excluded) {
      if (window.gtag) updateConsent("denied");
      setCollectionDisabled(measurementId, true);
      setReady(false);
      setConsent(null);
      return;
    }
    const saved = window.localStorage.getItem(consentKey);
    const value = saved === "granted" || saved === "denied" ? saved : "unset";
    defaultConsent();
    updateConsent(value);
    setCollectionDisabled(measurementId, value !== "granted");
    setConsent(value);
  }, [excluded, measurementId]);

  useEffect(() => {
    if (!measurementId || excluded || consent !== "granted") { setReady(false); return; }
    setCollectionDisabled(measurementId, false);
    updateConsent("granted");
    const initialize = () => {
      if (!window.__smkhGaInitialized) {
        window.gtag("js", new Date());
        window.gtag("config", measurementId, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
        window.__smkhGaInitialized = true;
      }
      setReady(true);
    };
    const existing = document.getElementById("smkh-ga4-script");
    if (existing) { if (window.__smkhGaInitialized) initialize(); else existing.addEventListener("load", initialize, { once: true }); return; }
    const script = document.createElement("script");
    script.id = "smkh-ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    script.addEventListener("load", initialize, { once: true });
    document.head.appendChild(script);
  }, [consent, excluded, measurementId]);

  useEffect(() => {
    if (!ready || excluded || consent !== "granted" || !pathname) return;
    if (window.__smkhLastPageView === pathname) return;
    window.__smkhLastPageView = pathname;
    window.gtag("event", "page_view", { page_path: pathname, page_location: `${window.location.origin}${pathname}`, page_title: document.title });
  }, [consent, excluded, pathname, ready]);

  useEffect(() => {
    const handler = (event) => {
      if (isExcludedPath(window.location.pathname)) return;
      const link = event.target.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") || "";
      const eventName = href.startsWith("tel:") ? "phone_click" : href.startsWith("mailto:") ? "email_click" : link.dataset.analyticsEvent;
      if (eventName) track(eventName, { location: link.dataset.analyticsLocation || "content", destination: href.startsWith("/") ? href.split("?")[0] : undefined });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  function choose(value) {
    window.localStorage.setItem(consentKey, value);
    setCollectionDisabled(measurementId, value !== "granted");
    updateConsent(value);
    if (value !== "granted") clearAnalyticsCookies();
    setConsent(value);
  }

  function reviewChoices() {
    window.localStorage.setItem(consentKey, "denied");
    setCollectionDisabled(measurementId, true);
    updateConsent("denied");
    clearAnalyticsCookies();
    setReady(false);
    setConsent("unset");
  }

  if (!measurementId || excluded) return null;
  if (consent === "unset") return <aside className="analytics-consent" aria-label="Analytics privacy choices"><div><strong>Privacy choices</strong><p>Allow privacy-conscious analytics to help improve this website? Seller form details are never intentionally sent to analytics.</p></div><div><button className="button button-secondary" type="button" onClick={() => choose("denied")}>Decline</button><button className="button" type="button" onClick={() => choose("granted")}>Allow analytics</button></div></aside>;
  if (consent === null) return null;
  return <button className="analytics-settings" type="button" onClick={reviewChoices} aria-label="Review analytics privacy choices">Privacy choices</button>;
}

