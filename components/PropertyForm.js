"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, LockKeyhole } from "lucide-react";
import { track } from "@/lib/analytics";
import {
  MARKETING_NOTICE_SHA256,
  MARKETING_NOTICE_TEXT,
  MARKETING_NOTICE_VERSION,
  PRIVACY_NOTICE_SHA256,
  PRIVACY_NOTICE_TEXT,
  PRIVACY_NOTICE_VERSION,
  SHARING_NOTICE_SHA256,
  SHARING_NOTICE_TEXT,
  SHARING_NOTICE_VERSION,
} from "@/lib/consent-notices";
import { PARTNER_DELIVERY_DISABLED_TEXT, SHORT_DISCLOSURE_TEXT } from "@/lib/disclosures";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_SERVICE_LABEL } from "@/lib/site";
import { formatPhoneNumber } from "@/lib/validation";
import PhoneLink from "./PhoneLink";
import TurnstileWidget from "./TurnstileWidget";

const empty = {
  propertyAddress: "", propertyCity: "", propertyZip: "", name: "", preferredContact: "email", email: "", phone: "",
  privacyAcknowledged: false, sharingConsent: false, marketingConsent: false, propertyType: "", condition: "", occupancy: "", timing: "", comments: "", website: "",
};

function firstStepErrors(data) {
  const next = {};
  if (data.propertyAddress.trim().length < 4) next.propertyAddress = "Enter the property street address.";
  if (data.propertyCity.trim().length < 2) next.propertyCity = "Enter the property city.";
  if (!/^\d{5}(-\d{4})?$/.test(data.propertyZip.trim())) next.propertyZip = "Enter a valid ZIP code.";
  if (data.name.trim().length < 2) next.name = "Enter your name.";
  if (data.preferredContact === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) next.email = "Enter a valid email address.";
  if (data.preferredContact === "phone" && data.phone.replace(/\D/g, "").length < 10) next.phone = "Enter a valid phone number.";
  if (!data.privacyAcknowledged) next.privacyAcknowledged = "Please acknowledge the privacy notice.";
  return next;
}

function getAttribution() {
  if (typeof window === "undefined") return {};
  const query = new URLSearchParams(window.location.search);
  return {
    landingUrl: `${window.location.origin}${window.location.pathname}`.slice(0, 500),
    referrer: document.referrer.slice(0, 500),
    utmSource: (query.get("utm_source") || "").slice(0, 100),
    utmMedium: (query.get("utm_medium") || "").slice(0, 100),
    utmCampaign: (query.get("utm_campaign") || "").slice(0, 120),
    utmContent: (query.get("utm_content") || "").slice(0, 120),
    utmTerm: (query.get("utm_term") || "").slice(0, 120),
  };
}

export default function PropertyForm({ compact = false, initialAddress = "", turnstileSiteKey = "", sharingAvailable = false, approvedSharingRecipients = [] }) {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const submissionToken = useRef(globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
  const started = useRef(false);
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ ...empty, propertyAddress: initialAddress });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetSignal, setTurnstileResetSignal] = useState(0);

  function resetTurnstile() {
    setTurnstileToken("");
    setTurnstileResetSignal((current) => current + 1);
  }

  function update(event) {
    const { name, type, checked, value } = event.target;
    setData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    if (!started.current) { started.current = true; track("seller_form_start", { form: "seller_inquiry" }); }
  }

  function updatePhone(event) {
    setData((current) => ({ ...current, phone: formatPhoneNumber(event.target.value) }));
    setErrors((current) => ({ ...current, phone: undefined }));
    if (!started.current) { started.current = true; track("seller_form_start", { form: "seller_inquiry" }); }
  }

  function validateFirstStep() {
    const next = firstStepErrors(data);
    setErrors(next);
    return !Object.keys(next).length;
  }

  function continueForm() {
    if (!validateFirstStep()) { track("seller_form_validation_error", { form: "seller_inquiry", step: 1, error_count: Object.keys(firstStepErrors(data)).length }); return; }
    setStep(2); setMessage(""); track("form_step", { form: "seller_inquiry", step: 2 });
  }

  async function submit(event) {
    event.preventDefault();
    if (!validateFirstStep()) { setStep(1); track("seller_form_validation_error", { form: "seller_inquiry", step: 1, error_count: Object.keys(firstStepErrors(data)).length }); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/leads", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...getAttribution(),
          turnstileToken,
          submissionToken: submissionToken.current,
          startedAt: startedAt.current,
          consentVersion: PRIVACY_NOTICE_VERSION,
          consentNoticeHash: PRIVACY_NOTICE_SHA256,
          sharingConsentVersion: SHARING_NOTICE_VERSION,
          sharingConsentNoticeHash: SHARING_NOTICE_SHA256,
          marketingConsentVersion: MARKETING_NOTICE_VERSION,
          marketingConsentNoticeHash: MARKETING_NOTICE_SHA256,
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {}); setMessage(result.message || "We could not send your inquiry. Please try again.");
        if (response.status === 422) track("seller_form_validation_error", { form: "seller_inquiry", step, error_count: Object.keys(result.errors || {}).length, source: "server" });
        resetTurnstile();
        if (result.errors && Object.keys(result.errors).some((key) => ["propertyAddress", "propertyCity", "propertyZip", "name", "email", "phone", "privacyAcknowledged"].includes(key))) setStep(1);
        return;
      }
      track("seller_form_submit_success", { form: "seller_inquiry" });
      if (!result.duplicate) track("generate_lead", { form: "seller_inquiry", source: "seller_web" });
      router.push("/thank-you");
    } catch {
      setMessage("We could not connect. Please check your connection and try again.");
      resetTurnstile();
    } finally { setBusy(false); }
  }

  const fieldError = (name) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]}</span> : null;
  const describedBy = (name) => errors[name] ? `${name}-error` : undefined;
  const firstStepIsValid = Object.keys(firstStepErrors(data)).length === 0;

  return <form id="property-form" className={`property-form ${compact ? "form-compact" : ""}`} onSubmit={submit} noValidate>
    <div className="form-heading"><div><span className="form-step">Step {step} of 2</span><h2>{step === 1 ? "Tell us where to start" : "Add property details"}</h2></div><span className="secure-note"><LockKeyhole size={16} /> Private inquiry</span></div>
    <div className="progress" aria-hidden="true"><span style={{ width: step === 1 ? "50%" : "100%" }} /></div>
    {!compact && step === 1 ? <div className="form-call-option"><span>Prefer to talk?</span><PhoneLink location="contact_form" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}>Call {BUSINESS_PHONE_DISPLAY}</PhoneLink><small>{BUSINESS_PHONE_SERVICE_LABEL}.</small></div> : null}
    {step === 1 ? <div className="form-fields">
      <div className="field-wide"><label htmlFor="propertyAddress">Property street address</label><input id="propertyAddress" name="propertyAddress" autoComplete="street-address" value={data.propertyAddress} onChange={update} aria-invalid={Boolean(errors.propertyAddress)} aria-describedby={describedBy("propertyAddress")} placeholder="123 Oak Street" />{fieldError("propertyAddress")}</div>
      <div><label htmlFor="propertyCity">City</label><input id="propertyCity" name="propertyCity" autoComplete="address-level2" value={data.propertyCity} onChange={update} aria-invalid={Boolean(errors.propertyCity)} aria-describedby={describedBy("propertyCity")} placeholder="Bakersfield" />{fieldError("propertyCity")}</div>
      <div><label htmlFor="propertyZip">ZIP code</label><input id="propertyZip" name="propertyZip" inputMode="numeric" autoComplete="postal-code" value={data.propertyZip} onChange={update} aria-invalid={Boolean(errors.propertyZip)} aria-describedby={describedBy("propertyZip")} placeholder="93301" />{fieldError("propertyZip")}</div>
      <div className="field-wide"><label htmlFor="name">Your name</label><input id="name" name="name" autoComplete="name" value={data.name} onChange={update} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name")} />{fieldError("name")}</div>
      <fieldset className="field-wide"><legend>How should we contact you?</legend><div className="choice-row"><label><input type="radio" name="preferredContact" value="email" checked={data.preferredContact === "email"} onChange={update} /> Email</label><label><input type="radio" name="preferredContact" value="phone" checked={data.preferredContact === "phone"} onChange={update} /> Phone</label></div></fieldset>
      {data.preferredContact === "email" ? <div className="field-wide"><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" value={data.email} onChange={update} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} />{fieldError("email")}</div> : <div className="field-wide"><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" maxLength="14" pattern={"\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}"} value={data.phone} onChange={updatePhone} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy("phone")} placeholder="(661) 555-1234" />{fieldError("phone")}</div>}
      <label className="check-field field-wide"><input type="checkbox" name="privacyAcknowledged" checked={data.privacyAcknowledged} onChange={update} aria-invalid={Boolean(errors.privacyAcknowledged)} /><span>{PRIVACY_NOTICE_TEXT.slice(0, -"See the Privacy Policy.".length)}See the <a href="/privacy-policy" target="_blank">Privacy Policy</a>.</span></label>{fieldError("privacyAcknowledged")}
      <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex="-1" autoComplete="off" value={data.website} onChange={update} /></div>
      <button className="button field-wide" type="button" onClick={continueForm} disabled={!firstStepIsValid} title={!firstStepIsValid ? "Complete all required fields to continue." : undefined}>Continue <ArrowRight size={18} /></button>
    </div> : <div className="form-fields">
      <div><label htmlFor="propertyType">Property type <span>Optional</span></label><select id="propertyType" name="propertyType" value={data.propertyType} onChange={update}><option value="">Choose one</option><option>Single-family home</option><option>Condo or townhome</option><option>Multi-unit property</option><option>Manufactured home</option><option>Other</option></select></div>
      <div><label htmlFor="condition">Approximate condition <span>Optional</span></label><select id="condition" name="condition" value={data.condition} onChange={update}><option value="">Choose one</option><option>Move-in ready</option><option>Minor updates needed</option><option>Significant repairs needed</option><option>Unsure</option></select></div>
      <div><label htmlFor="occupancy">Occupancy <span>Optional</span></label><select id="occupancy" name="occupancy" value={data.occupancy} onChange={update}><option value="">Choose one</option><option>Owner occupied</option><option>Tenant occupied</option><option>Vacant</option><option>Other</option></select></div>
      <div><label htmlFor="timing">Desired timing <span>Optional</span></label><select id="timing" name="timing" value={data.timing} onChange={update}><option value="">Choose one</option><option>Exploring options</option><option>Within 30 days</option><option>1–3 months</option><option>3+ months</option><option>Unsure</option></select></div>
      <div className="field-wide"><label htmlFor="comments">What would be helpful for us to know? <span>Optional</span></label><textarea id="comments" name="comments" rows="4" maxLength="2000" value={data.comments} onChange={update} /><small>Do not include bank, mortgage, access-code, or other sensitive information.</small></div>
      <div className="field-wide consent-choice-group">
        <label className="check-field"><input type="checkbox" name="sharingConsent" checked={data.sharingConsent} onChange={update} disabled={!sharingAvailable} aria-invalid={Boolean(errors.sharingConsent)} aria-describedby={describedBy("sharingConsent")} /><span>{SHARING_NOTICE_TEXT}</span></label>{fieldError("sharingConsent")}
        {sharingAvailable ? <p className="consent-recipient-list"><strong>Approved recipients:</strong> {approvedSharingRecipients.map((recipient) => recipient.name).join(", ")}.</p> : <p className="consent-unavailable"><strong>Not currently available:</strong> {PARTNER_DELIVERY_DISABLED_TEXT}</p>}
      </div>
      <label className="check-field field-wide"><input type="checkbox" name="marketingConsent" checked={data.marketingConsent} onChange={update} aria-invalid={Boolean(errors.marketingConsent)} aria-describedby={describedBy("marketingConsent")} /><span>{MARKETING_NOTICE_TEXT}</span></label>{fieldError("marketingConsent")}
      <div className="field-wide"><TurnstileWidget siteKey={turnstileSiteKey} onToken={setTurnstileToken} onStatus={setMessage} resetSignal={turnstileResetSignal} /></div>
      {message ? <div className="form-alert field-wide" role="alert">{message}</div> : null}
      <p className="submit-disclosure field-wide">{SHORT_DISCLOSURE_TEXT}</p>
      <div className="form-actions field-wide"><button className="button button-secondary" type="button" onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button><button className="button" type="submit" disabled={busy || !turnstileToken}>{busy ? <><LoaderCircle className="spin" size={18} /> Sending…</> : <>Send My Inquiry <Check size={18} /></>}</button></div>
    </div>}
    {step === 1 && message ? <div className="form-alert" role="alert">{message}</div> : null}
    <p className="form-fineprint">SellMyKernHome.com is operated by Workside Software as a homeowner inquiry and lead-generation service. We are not a real estate brokerage or property buyer and do not represent buyers or sellers. Submitting an inquiry does not create an agency, brokerage, purchase, or other contractual relationship.</p>
  </form>;
}

