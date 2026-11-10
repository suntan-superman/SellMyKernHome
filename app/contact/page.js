import PageHero from "@/components/PageHero";
import PropertyForm from "@/components/PropertyForm";
import RelatedResources from "@/components/RelatedResources";
import { getSellerFormConfiguration } from "@/lib/form-config";
import { OPERATOR_DISCLOSURE, buildPageMetadata } from "@/lib/site";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";

export const metadata = buildPageMetadata({ title: "Start a Bakersfield Property Inquiry", description: "Privately share basic details about a Bakersfield or Kern County property and choose how Sell My Kern Home may contact you.", path: "/contact" });
export default function ContactPage() { const form = getSellerFormConfiguration(); return <main id="main-content"><PageHero eyebrow="CONTACT" title="Tell us what would make the conversation useful" intro="Use the secure inquiry form below to share the property details and your preferred contact method." breadcrumbs={[{ label: "Contact" }]} /><section className="section content-shell situation-detail"><div><PropertyForm {...form} /></div><aside><h2>Before you send</h2><p>{OPERATOR_DISCLOSURE}</p><p>Share the property facts and your priorities. Please leave out financial account details, mortgage balances, access codes, government identification, or sensitive legal documents.</p><div className="notice"><strong>Who receives this now:</strong> The inquiry is available to {form.recipientAudience} and service providers used to securely process and store it. External delivery is disabled.</div><LeadGenerationDisclosure compact /></aside></section><RelatedResources title="Review the process first" links={[["/how-it-works", "See what happens after an inquiry"], ["/privacy-policy", "Read the privacy policy"], ["/privacy-choices", "Do Not Sell or Share My Personal Information"], ["/faq", "Review common seller questions"]]} /></main>; }

