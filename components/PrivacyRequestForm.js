"use client";

import { useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import {
  PRIVACY_REQUEST_NOTICE_SHA256,
  PRIVACY_REQUEST_NOTICE_TEXT,
  PRIVACY_REQUEST_NOTICE_VERSION,
} from "@/lib/consent-notices";
import { formatPhoneNumber } from "@/lib/validation";
import TurnstileWidget from "./TurnstileWidget";

export default function PrivacyRequestForm({ turnstileSiteKey = "" }) {
  const startedAt = useRef(Date.now());
  const requestToken = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const [data, setData] = useState({ email: "", phone: "", acknowledged: false, website: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  function update(event) {
    const { name, type, checked, value } = event.target;
    setData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined, contact: undefined }));
  }

  function updatePhone(event) {
    setData((current) => ({ ...current, phone: formatPhoneNumber(event.target.value) }));
    setErrors((current) => ({ ...current, phone: undefined, contact: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setReference("");
    try {
      const response = await fetch("/api/privacy-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          requestToken: requestToken.current,
          startedAt: startedAt.current,
          turnstileToken,
          noticeVersion: PRIVACY_REQUEST_NOTICE_VERSION,
          noticeHash: PRIVACY_REQUEST_NOTICE_SHA256,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        setMessage(result.message || "We could not record your request. Please try again.");
        setTurnstileToken("");
        setTurnstileResetSignal((current) => current + 1);
        return;
      }
      setMessage("Your do-not-sell-or-share preference has been recorded. Workside may contact you only if identity verification or clarification is needed.");
      setReference(result.reference || "");
    } catch {
      setMessage("We could not connect. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const error = (name) => errors[name] ? <span className="field-error" id={`privacy-${name}-error`}>{errors[name]}</span> : null;

  if (reference) return <div className="privacy-request-success" role="status"><Check size={24} /><div><h2>Preference recorded</h2><p>{message}</p><p><strong>Reference:</strong> {reference}</p></div></div>;

  return <form className="privacy-request-form" onSubmit={submit} noValidate>
    <h2>Do Not Sell or Share My Personal Information</h2>
    <p>Provide at least one contact value previously used with Sell My Kern Home. This creates a suppression record for future external transfers. It does not delete your first-party inquiry or automatically retrieve information previously disclosed to an independent party.</p>
    <div className="form-fields">
      <div><label htmlFor="privacy-email">Email address <span>Optional if phone is provided</span></label><input id="privacy-email" name="email" type="email" autoComplete="email" value={data.email} onChange={update} aria-invalid={Boolean(errors.email || errors.contact)} />{error("email")}</div>
      <div><label htmlFor="privacy-phone">Phone number <span>Optional if email is provided</span></label><input id="privacy-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength="14" value={data.phone} onChange={updatePhone} placeholder="(661) 555-1234" aria-invalid={Boolean(errors.phone || errors.contact)} />{error("phone")}</div>
      {error("contact")}
      <label className="check-field field-wide"><input type="checkbox" name="acknowledged" checked={data.acknowledged} onChange={update} aria-invalid={Boolean(errors.acknowledged)} /><span>{PRIVACY_REQUEST_NOTICE_TEXT}</span></label>{error("acknowledged")}
      <div className="honeypot" aria-hidden="true"><label htmlFor="privacy-website">Website</label><input id="privacy-website" name="website" tabIndex="-1" autoComplete="off" value={data.website} onChange={update} /></div>
      <div className="field-wide"><TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} onStatus={setMessage} resetSignal={turnstileResetSignal} /></div>
      {message ? <div className="form-alert field-wide" role="alert">{message}</div> : null}
      <button className="button field-wide" type="submit" disabled={busy || !turnstileToken || !data.acknowledged || (!data.email && !data.phone)}>{busy ? <><LoaderCircle className="spin" size={18} /> Recording…</> : <>Record My Privacy Choice <Check size={18} /></>}</button>
    </div>
  </form>;
}
