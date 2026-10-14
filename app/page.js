import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Handshake, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import PropertyForm from "@/components/PropertyForm";
import SituationGrid from "@/components/SituationGrid";
import Process from "@/components/Process";
import CTA from "@/components/CTA";

const faqs = [
  ["What happens after I submit?", "We review the details you provide and contact you using your preferred method to learn more. Submitting is a request for a conversation, not a commitment to sell."],
  ["Do I need to know exactly what I want to do?", "No. You can begin by sharing the property and your priorities. We will not assume a particular transaction path before discussing your situation."],
  ["Should I include mortgage or financial information?", "No. Please do not send mortgage balances, bank details, access codes, or other sensitive information through this form."],
];

export default function HomePage() {
  const websiteSchema = { "@context": "https://schema.org", "@type": "WebSite", name: "Sell My Kern Home", url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000" };
  return <main id="main-content">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema).replaceAll("<", "\\u003c") }} />
    <section className="hero">
      <div className="hero-copy"><p className="eyebrow">BAKERSFIELD &amp; KERN COUNTY</p><h1>Thinking About Selling Your Kern County Home?</h1><p className="hero-subhead">Tell us about your property and what you&apos;re hoping to accomplish. We&apos;ll review the details and contact you to discuss possible next steps—without pressure.</p><div className="hero-trust"><span><ShieldCheck /> Private inquiry</span><span><MessageCircle /> Clear next steps</span><span><Handshake /> No obligation to submit</span></div></div>
      <div className="hero-visual"><Image src="/images/bakersfield-home.jpg" alt="A residential home in Bakersfield, California" fill priority sizes="(max-width: 900px) 100vw, 52vw" /><span className="image-caption"><MapPin size={15} /> Bakersfield, California</span></div>
      <div className="hero-form-wrap"><PropertyForm compact /></div>
    </section>

    <section className="reassurance"><p><strong>A useful conversation starts with the property—not pressure.</strong> Your inquiry goes to the GNZ team for review. Share only what feels relevant now.</p></section>

    <section className="section content-shell"><div className="section-heading"><div><p className="eyebrow">WHERE WE CAN START</p><h2>Situations We Can Discuss</h2></div><p>Every property comes with a different story. These guides can help you organize the facts and questions that matter before a conversation.</p></div><SituationGrid /></section>

    <section className="section process-section"><div className="content-shell"><div className="section-heading"><div><p className="eyebrow">HOW IT WORKS</p><h2>Three clear, unhurried steps</h2></div><p>No invented deadlines or one-size-fits-all promises—just a practical way to begin.</p></div><Process /><Link className="text-link section-link" href="/how-it-works">See what to expect <ArrowRight size={17} /></Link></div></section>

    <section className="section content-shell why-grid"><div className="why-intro"><p className="eyebrow">WHY WORK WITH US</p><h2>Local context. Respectful conversation.</h2><p>We focus on understanding the property and what you want to accomplish, then communicating clearly about what may come next.</p><Link className="button button-secondary" href="/about">About this initiative</Link></div><div className="why-list">
      <article><span>01</span><div><h3>Kern County focus</h3><p>A conversation grounded in the local property context—not a generic national script.</p></div></article>
      <article><span>02</span><div><h3>Property-specific options</h3><p>Repairs, occupancy, timing, and decision-makers all shape the discussion.</p></div></article>
      <article><span>03</span><div><h3>Clear communication</h3><p>We explain what information is needed and distinguish a conversation from a commitment.</p></div></article>
      <article><span>04</span><div><h3>Respect for your decision</h3><p>You can ask questions, seek independent advice, and decide whether to continue.</p></div></article>
    </div></section>

    <section className="section about-strip"><div className="content-shell"><div className="about-mark" aria-hidden="true">K</div><div><p className="eyebrow">ABOUT SELL MY KERN HOME</p><h2>A focused property-inquiry service, affiliated with GNZ Marketing.</h2><p>The final contracting entity, operator biography, and transaction role are pending owner confirmation and California legal review. Until then, this site makes no claim that GNZ purchases property, acts as a broker, or guarantees a particular outcome.</p><Link className="text-link" href="/about">Read our current disclosures <ArrowRight size={17} /></Link></div></div></section>

    <section className="section content-shell faq-preview"><div><p className="eyebrow">COMMON QUESTIONS</p><h2>Useful answers before you begin</h2></div><div>{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}<Link className="text-link" href="/faq">View all frequently asked questions <ArrowRight size={17} /></Link></div></section>
    <CTA />
  </main>;
}

