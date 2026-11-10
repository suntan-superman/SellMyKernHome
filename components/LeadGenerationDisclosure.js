import Link from "next/link";
import {
  FULL_DISCLOSURE_PARAGRAPHS,
  PARTNER_DELIVERY_DISABLED_TEXT,
} from "@/lib/disclosures";

export default function LeadGenerationDisclosure({ compact = false }) {
  return <section className={compact ? "lead-disclosure lead-disclosure-compact" : "lead-disclosure"} aria-labelledby={compact ? "form-disclosure-title" : "lead-disclosure-title"}>
    <h2 id={compact ? "form-disclosure-title" : "lead-disclosure-title"}>Who we are and how this site works</h2>
    {FULL_DISCLOSURE_PARAGRAPHS.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    <p className="disclosure-status"><strong>Current sharing status:</strong> {PARTNER_DELIVERY_DISABLED_TEXT}</p>
    {compact ? <p><Link href="/how-it-works#sharing-disclosure">Read the complete How It Works disclosure</Link>.</p> : null}
  </section>;
}
