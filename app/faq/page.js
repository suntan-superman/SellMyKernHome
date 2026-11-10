import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import RelatedResources from "@/components/RelatedResources";
import { buildPageMetadata } from "@/lib/site";

const faqs = [
  ["Does Sell My Kern Home buy houses?", "No. Workside Software and Sell My Kern Home are not property buyers or brokerages. If you separately consent and an approved independent wholesaler or investor is later available, that company must identify its own role and terms."],
  ["How is Workside Software paid?", "An approved independent wholesaler or investor may pay Workside Software a flat fee for a contact. The fee does not depend on whether you sign or sell, the price you receive, or whether a closing occurs. Workside does not receive part of your sale proceeds. External delivery is currently disabled."],
  ["Is submitting the form an agreement to sell?", "No. It is a request to be contacted about the property. No agency, brokerage, purchase, or other contractual relationship is created by submitting an inquiry."],
  ["What information should I provide?", "The address, your preferred contact method, and a short description of the situation are enough to start. Property type, condition, occupancy, timing, and comments are optional."],
  ["What information should I leave out?", "Do not include bank or mortgage details, Social Security numbers, door or alarm codes, legal documents, or other sensitive information."],
  ["Do I need to make repairs first?", "Not to begin a conversation. Whether repairs would be useful depends on the property and the paths you want to compare."],
  ["Can you help with probate or foreclosure?", "This site does not provide legal advice, probate services, or foreclosure rescue. A qualified California attorney can explain deadlines and legal options."],
  ["Will my information be sold?", "The inquiry is handled by authorized Sell My Kern Home administrators and service providers needed to process, store, protect, and respond to it. See the Privacy Policy for more information."],
  ["How soon will someone contact me?", "Response timing can vary. This website does not promise a particular response or transaction timeline."],
  ["Do you charge commissions or fees?", "This website does not state that a particular commission, fee, or cost applies. Any proposed costs and transaction terms should be provided in writing for you to review."],
  ["Can I get independent advice?", "Yes. You may consult an attorney, tax professional, licensed real-estate professional, contractor, or other independent adviser before making a decision."],
];

export const metadata = buildPageMetadata({ title: "Bakersfield Home Seller Questions", description: "Answers for Bakersfield and Kern County property owners about inquiries, repairs, privacy, professional roles, fees, and possible next steps.", path: "/faq" });
export default function FAQPage() {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) };
  return <main id="main-content"><JsonLd data={schema} /><PageHero eyebrow="FREQUENTLY ASKED QUESTIONS" title="Clear answers before you share property details" intro="These responses explain the inquiry process and the boundaries of the information on this site." breadcrumbs={[{ label: "FAQ" }]} /><section className="section content-shell faq-preview"><div><h2>Questions from property owners</h2></div><div>{faqs.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section><RelatedResources title="Explore the next step" links={[["/how-it-works", "See how the inquiry process works"], ["/sell-your-house-bakersfield", "Compare Bakersfield home-selling options"], ["/contact", "Share your property details privately"]]} /><CTA /></main>;
}

