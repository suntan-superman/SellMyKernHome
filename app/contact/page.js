import PageHero from "@/components/PageHero";
import PropertyForm from "@/components/PropertyForm";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "Contact", description: "Start a private conversation with the GNZ team about a Bakersfield or Kern County property.", path: "/contact" });
export default function ContactPage() { return <main id="main-content"><PageHero eyebrow="CONTACT" title="Tell us what would make the conversation useful" intro="Use the secure inquiry form below to share the property details and your preferred contact method." breadcrumbs={[{ label: "Contact" }]} /><section className="section content-shell situation-detail"><div><PropertyForm /></div><aside><h2>Before you send</h2><p>Share the property facts and your priorities. Please leave out financial account details, mortgage balances, access codes, or sensitive legal documents.</p><div className="notice"><strong>Who receives this:</strong> The inquiry is available to authorized GNZ administrators and the service providers used to securely process, store, and notify them.</div></aside></section></main>; }

