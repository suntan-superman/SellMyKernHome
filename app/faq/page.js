import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import { buildPageMetadata } from "@/lib/site";

const faqs = [
  ["Does Sell My Kern Home buy houses?", "This website provides an inquiry channel and does not promise that GNZ or another party will buy a property. Any proposed role, contracting party, or transaction terms would need to be identified and documented separately."],
  ["Is submitting the form an agreement to sell?", "No. It is a request to be contacted about the property. No agency, brokerage, purchase, or other contractual relationship is created by submitting an inquiry."],
  ["What information should I provide?", "The address, your preferred contact method, and a short description of the situation are enough to start. Property type, condition, occupancy, timing, and comments are optional."],
  ["What information should I leave out?", "Do not include bank or mortgage details, Social Security numbers, door or alarm codes, legal documents, or other sensitive information."],
  ["Do I need to make repairs first?", "Not to begin a conversation. Whether repairs would be useful depends on the property and the paths you want to compare."],
  ["Can you help with probate or foreclosure?", "This site does not provide legal advice, probate services, or foreclosure rescue. A qualified California attorney can explain deadlines and legal options."],
  ["Will my information be sold?", "The inquiry is handled by authorized GNZ personnel and service providers needed to process, store, protect, and respond to it. See the Privacy Policy for more information."],
  ["How soon will someone contact me?", "Response timing can vary. This website does not promise a particular response or transaction timeline."],
  ["Do you charge commissions or fees?", "This website does not state that a particular commission, fee, or cost applies. Any proposed costs and transaction terms should be provided in writing for you to review."],
  ["Can I get independent advice?", "Yes. You may consult an attorney, tax professional, licensed real-estate professional, contractor, or other independent adviser before making a decision."],
];

export const metadata = buildPageMetadata({ title: "Frequently Asked Questions", description: "Answers about Sell My Kern Home inquiries, privacy boundaries, property details, and next steps.", path: "/faq" });
export default function FAQPage() { return <main id="main-content"><PageHero eyebrow="FREQUENTLY ASKED QUESTIONS" title="Clear answers before you share property details" intro="These responses explain the inquiry process and the boundaries of the information on this site." breadcrumbs={[{ label: "FAQ" }]} /><section className="section content-shell faq-preview"><div><h2>Questions from property owners</h2></div><div>{faqs.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></section><CTA /></main>; }

