import Link from "next/link";
import Logo from "./Logo";
import PhoneLink from "./PhoneLink";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_SERVICE_LABEL } from "@/lib/site";
import { SHORT_DISCLOSURE_TEXT } from "@/lib/disclosures";

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-grid">
      <div className="footer-brand"><Logo light /><p>A homeowner inquiry and lead-generation service for Bakersfield and Kern County, operated by Workside Software. Not a real estate brokerage or property buyer.</p></div>
      <div><h2>Explore</h2><Link href="/how-it-works">How It Works</Link><Link href="/selling-situations">Selling Situations</Link><Link href="/insights">Insights</Link><Link href="/about">About</Link></div>
      <div><h2>Get started</h2><Link href="/#property-form">Discuss My Property</Link><PhoneLink className="footer-phone" location="footer" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}>{BUSINESS_PHONE_DISPLAY}</PhoneLink><span className="footer-phone-note">{BUSINESS_PHONE_SERVICE_LABEL}</span><Link href="/contact">Contact</Link><Link href="/faq">Frequently Asked Questions</Link></div>
      <div><h2>Legal</h2><Link href="/privacy-policy">Privacy Policy</Link><Link href="/privacy-choices">Do Not Sell or Share My Personal Information</Link><Link href="/terms">Terms</Link><p className="legal-note">General information only. No transaction outcome is promised.</p></div>
    </div>
    <p className="footer-disclosure">{SHORT_DISCLOSURE_TEXT}</p>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Sell My Kern Home.</span><span>Operated by Workside Software. No buyer or seller representation.</span></div>
  </footer>;
}

