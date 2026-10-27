import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import PageHero from "./PageHero";
import CTA from "./CTA";

export default function SellerLandingPage({ page }) {
  return <main id="main-content">
    <PageHero eyebrow={page.eyebrow} title={page.title} intro={page.intro} breadcrumbs={[{ href: "/selling-situations", label: "Selling Situations" }, { label: page.title }]} />
    <section className="prose-section"><div className="prose-narrow"><p className="seller-page-lead">{page.lead}</p><p><Link className="button" href="/#property-form" data-analytics-event="primary_cta_click" data-analytics-location="seller_page_intro">Discuss My Property <ArrowRight size={18} /></Link></p></div></section>
    <section className="section process-section"><div className="content-shell"><div className="section-heading"><div><p className="eyebrow">WHAT TO COMPARE</p><h2>Build the decision around the facts</h2></div><p>Use written information and independent advice where appropriate. No price, timing, or outcome is guaranteed.</p></div><div className="consideration-grid">{page.considerations.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section content-shell situation-detail"><div><p className="eyebrow">QUESTIONS TO ORGANIZE</p><h2>Before you choose a path</h2><ul className="check-list">{page.questions.map((question) => <li key={question}><CheckCircle2 size={19} /> {question}</li>)}</ul></div><aside className="notice"><h3>GNZ&apos;s role in the first step</h3><p>GNZ receives and reviews the property information you choose to provide, then may contact you to discuss the situation. An inquiry is not a listing, agency agreement, purchase contract, or promise of an offer.</p></aside></section>
    <section className="prose-section"><div className="prose-narrow"><h2>Related property resources</h2><ul className="related-links">{page.related.map(([href, label]) => <li key={href}><Link href={href}>{label} <ArrowRight size={16} /></Link></li>)}</ul></div></section>
    <CTA title="Ready to share the property facts?" />
  </main>;
}
