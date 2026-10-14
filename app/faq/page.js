import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";

const faqs = [
  ["Does Sell My Kern Home buy houses?", "That claim is intentionally not made in this review build. The business transaction model and contracting entity require owner confirmation and California legal review."],
  ["Is submitting the form an agreement to sell?", "No. It is a request to be contacted about the property. No agency, brokerage, purchase, or other contractual relationship is created by submitting an inquiry."],
  ["What information should I provide?", "The address, your preferred contact method, and a short description of the situation are enough to start. Property type, condition, occupancy, timing, and comments are optional."],
  ["What information should I leave out?", "Do not include bank or mortgage details, Social Security numbers, door or alarm codes, legal documents, or other sensitive information."],
  ["Do I need to make repairs first?", "Not to begin a conversation. Whether repairs would be useful depends on the property and the paths you want to compare. No as-is purchase claim is made here."],
  ["Can you help with probate or foreclosure?", "This site does not provide legal advice, probate services, or foreclosure rescue. A qualified California attorney can explain deadlines and legal options."],
  ["Will my information be sold?", "The intended handling is limited to GNZ personnel and service providers needed to process and respond to the inquiry. Final policy language, retention rules, and vendor list require owner and legal approval before launch."],
  ["How soon will someone contact me?", "No response-time promise is made until the owner confirms actual staffing and service standards."],
  ["Do you charge commissions or fees?", "No claim about commissions, fees, or costs is made until the business model and disclosures are legally reviewed. Any proposed terms should be provided in writing for you to review."],
  ["Can I get independent advice?", "Yes. You may consult an attorney, tax professional, licensed real-estate professional, contractor, or other independent adviser before making a decision."],
];

export const metadata = { title: "Frequently Asked Questions", description: "Answers about Sell My Kern Home inquiries, privacy boundaries, property details, and next steps.", alternates: { canonical: "/faq" } };
export default function FAQPage() { const schema = { "@context":"https://schema.org", "@type":"FAQPage", mainEntity:faqs.map(([q,a]) => ({ "@type":"Question", name:q, acceptedAnswer:{ "@type":"Answer", text:a } })) }; return <main id="main-content"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replaceAll("<", "\\u003c") }} /><PageHero eyebrow="FREQUENTLY ASKED QUESTIONS" title="Clear answers, including where answers are still pending" intro="These responses explain the current inquiry process without making assumptions about an unapproved transaction model." breadcrumbs={[{ label: "FAQ" }]} /><section className="section content-shell faq-preview"><div><h2>Questions from property owners</h2></div><div>{faqs.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section><CTA /></main>; }

