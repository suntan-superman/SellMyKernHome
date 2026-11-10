import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Handshake, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import PropertyForm from "@/components/PropertyForm";
import { getSellerFormConfiguration } from "@/lib/form-config";
import SituationGrid from "@/components/SituationGrid";
import Process from "@/components/Process";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import PhoneLink from "@/components/PhoneLink";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_E164, BUSINESS_PHONE_SERVICE_LABEL, OPERATOR_DISCLOSURE, OPERATOR_NAME, SITE_NAME, SITE_URL } from "@/lib/site";

const faqs = [
  ["What happens after I submit?", "Authorized Sell My Kern Home administrators review the details and may contact you using your preferred method. External sharing requires a separate choice, an identified approved recipient, and an active delivery workflow. Submitting is not a commitment to sell."],
  ["Do I need to know exactly what I want to do?", "No. You can begin by sharing the property and your priorities. We will not assume a particular transaction path before discussing your situation."],
  ["Should I include mortgage or financial information?", "No. Please do not send mortgage balances, bank details, access codes, or other sensitive information through this form."],
];

export default function HomePage() {
  const form = getSellerFormConfiguration();
  const websiteSchema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: OPERATOR_NAME, alternateName: SITE_NAME, url: SITE_URL, logo: `${SITE_URL}/icon.svg`, telephone: BUSINESS_PHONE_E164, brand: { "@type": "Brand", name: SITE_NAME }, contactPoint: { "@type": "ContactPoint", telephone: BUSINESS_PHONE_E164, contactType: "homeowner inquiries", availableLanguage: "English" }, description: "Workside Software operates SellMyKernHome.com as a homeowner inquiry and lead-generation service for Bakersfield and Kern County. It is not a real estate brokerage or property buyer." },
    { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-US" },
  ] };
  return <main id="main-content">
    <JsonLd data={websiteSchema} />
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">BAKERSFIELD &amp; KERN COUNTY</p><h1>Your Home. Your Options. Your Decision.</h1><p className="hero-subhead">Explore your options for selling a house in Bakersfield or Kern County—whether it needs repairs, is inherited, is vacant, or you&apos;re simply ready for a change.</p><div className="hero-actions"><Link className="button" href="#property-form" data-analytics-event="primary_cta_click" data-analytics-location="homepage_hero">Tell Us About Your Property <ArrowRight size={18} /></Link><PhoneLink className="button button-secondary hero-phone" location="homepage_hero" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}>Prefer to Talk? Call {BUSINESS_PHONE_DISPLAY}</PhoneLink></div><p className="hero-phone-note">Call anytime — {BUSINESS_PHONE_SERVICE_LABEL}.</p><p className="hero-tool-link"><Link className="text-link" href="/tools/home-sale-net-proceeds-calculator" data-analytics-event="calculator_cta_click" data-analytics-location="homepage_hero">Use the Free Net Proceeds Calculator <ArrowRight size={17} /></Link></p><div className="hero-trust"><span><ShieldCheck /> Private inquiry</span><span><MessageCircle /> Clear next steps</span><span><Handshake /> No obligation to sell.</span></div></div>
      <div className="hero-visual"><Image src="/images/craftsman-home-exterior-v2.webp" alt="Blue-gray Craftsman-style home with a welcoming lit porch and landscaped front walk" fill priority sizes="(max-width: 900px) 100vw, 52vw" /><span className="image-caption"><MapPin size={15} /> Serving Bakersfield &amp; Kern County</span></div>
      <div className="hero-form-wrap"><PropertyForm compact {...form} /></div>
    </section>

    <section className="reassurance"><p><strong>A useful conversation starts with the property—not pressure.</strong> Your inquiry goes only to {form.recipientTeam} for first-party review. External partner delivery is currently disabled and requires a separate permission and identified approved recipient before activation. Share only what feels relevant now.</p></section>

    <section className="section content-shell"><div className="section-heading"><div><p className="eyebrow">WHERE WE CAN START</p><h2>Situations We Can Discuss</h2></div><p>Every property comes with a different story. These guides can help you organize the facts and questions that matter before a conversation.</p></div><SituationGrid /><p className="section-link"><Link className="text-link" href="/sell-your-house-bakersfield">Compare Bakersfield home-selling options <ArrowRight size={17} /></Link></p></section>

    <section className="section process-section"><div className="content-shell"><div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2>Three clear, unhurried steps</h2></div><p>No invented deadlines or one-size-fits-all promises—just a practical way to begin.</p></div><Process /><Link className="text-link section-link" href="/how-it-works">See what to expect <ArrowRight size={17} /></Link></div></section>

    <section className="section content-shell why-grid"><div className="why-intro"><p className="eyebrow">WHY START HERE</p><h2>Local context. Respectful conversation.</h2><p>We collect the property facts and what you hope to accomplish so authorized administrators can respond clearly without implying a transaction role.</p><Link className="button button-secondary" href="/about">About this service</Link></div><div className="why-list">
      <article><span>01</span><div><h3>Kern County focus</h3><p>A conversation grounded in the local property context—not a generic national script.</p></div></article>
      <article><span>02</span><div><h3>Property-specific options</h3><p>Repairs, occupancy, timing, and decision-makers all shape the discussion.</p></div></article>
      <article><span>03</span><div><h3>Clear communication</h3><p>We explain what information is needed and distinguish a conversation from a commitment.</p></div></article>
      <article><span>04</span><div><h3>Respect for your decision</h3><p>You can ask questions, seek independent advice, and decide whether to continue.</p></div></article>
    </div></section>

    <section className="section about-strip"><div className="content-shell"><div className="about-mark" aria-hidden="true">K</div><div><p className="eyebrow">ABOUT SELL MY KERN HOME</p><h2>A Workside-operated homeowner inquiry service.</h2><p>{OPERATOR_DISCLOSURE} An inquiry does not create an agency, brokerage, purchase, or other contractual relationship, and no particular price, timing, or outcome is promised.</p><Link className="text-link" href="/about">Learn about this service <ArrowRight size={17} /></Link></div></div></section>

    <section className="section content-shell faq-preview"><div><p className="eyebrow">COMMON QUESTIONS</p><h2>Useful answers before you begin</h2></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}<Link className="text-link" href="/faq">View all frequently asked questions <ArrowRight size={17} /></Link></div></section>
    <CTA />
  </main>;
}

