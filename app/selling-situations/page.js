import PageHero from "@/components/PageHero";
import SituationGrid from "@/components/SituationGrid";
import CTA from "@/components/CTA";

export const metadata = { title: "Selling Situations", description: "Practical starting points for inherited, repair-heavy, rental, vacant, and relocation property situations in Kern County.", alternates: { canonical: "/selling-situations" } };

export default function SituationsPage() { return <main id="main-content"><PageHero eyebrow="PROPERTY GUIDES" title="Every property situation starts with different questions" intro="Use these guides to organize the basic facts, identify where independent advice may help, and prepare for a clearer conversation." breadcrumbs={[{ label: "Selling Situations" }]} /><section className="section content-shell"><SituationGrid /><div className="notice"><strong>Information, not professional advice.</strong> These pages offer general planning questions only. They do not replace advice from a California attorney, tax professional, licensed real-estate professional, contractor, or other qualified adviser.</div></section><CTA /></main>; }

