import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";
import RelatedResources from "@/components/RelatedResources";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "About Our Bakersfield Property Service", description: "Learn how Sell My Kern Home serves Bakersfield and Kern County property owners with a private inquiry process and clearly stated boundaries.", path: "/about" });

export default function AboutPage() { return <main id="main-content"><PageHero eyebrow="ABOUT SELL MY KERN HOME" title="A respectful starting point for Kern County property owners" intro="SellMyKernHome.com is a homeowner inquiry and lead-generation service operated by Workside Software, built around clear communication, useful local context, and careful claims." breadcrumbs={[{ label: "About" }]} /><section className="prose-section"><div className="prose-narrow"><h2>Why this site exists</h2><p>Property owners sometimes want a direct conversation before deciding which sale path to pursue. This site gives Bakersfield and Kern County owners a straightforward way to share basic property details and explain what they hope to accomplish.</p><LeadGenerationDisclosure /><div className="notice"><strong>Your decision remains yours.</strong> You may compare alternatives and seek independent legal, tax, real-estate, financial, or construction advice before signing any agreement.</div></div></section><RelatedResources title="Learn more before reaching out" links={[["/how-it-works", "See how the property inquiry process works"], ["/privacy-policy", "Review how inquiry information is handled"], ["/contact", "Start a private property inquiry"]]} /><CTA /></main>; }

