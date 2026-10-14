import PageHero from "@/components/PageHero";
import PropertyForm from "@/components/PropertyForm";

export const metadata = { title: "Contact", description: "Start a private conversation with the GNZ team about a Bakersfield or Kern County property.", alternates: { canonical: "/contact" } };
export default function ContactPage() { return <main id="main-content"><PageHero eyebrow="CONTACT" title="Tell us what would make the conversation useful" intro="Use the secure inquiry form below. Approved telephone, email, and mailing details will be added after owner verification." breadcrumbs={[{ label: "Contact" }]} /><section className="section content-shell situation-detail"><div><PropertyForm /></div><aside><h2>Before you send</h2><p>Share the property facts and your priorities. Please leave out financial account details, mortgage balances, access codes, or sensitive legal documents.</p><div className="notice"><strong>Who receives this:</strong> The inquiry is intended for authorized GNZ administrators and the service providers required to securely store and notify them. Final privacy and retention terms require approval before launch.</div></aside></section></main>; }

