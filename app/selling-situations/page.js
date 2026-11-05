import PageHero from "@/components/PageHero";
import SituationGrid from "@/components/SituationGrid";
import CTA from "@/components/CTA";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "Kern County Home-Selling Situations", description: "Practical Bakersfield and Kern County guides for inherited, repair-heavy, tenant-occupied, vacant, and relocation property situations.", path: "/selling-situations" });

export default function SituationsPage() { return <main id="main-content"><PageHero eyebrow="PROPERTY GUIDES" title="Home-selling situations in Bakersfield and Kern County" intro="Use these guides to organize the basic facts, identify where independent advice may help, and prepare for a clearer conversation." breadcrumbs={[{ label: "Selling Situations" }]} /><section className="section content-shell"><SituationGrid /><div className="notice"><strong>Information, not professional advice.</strong> These pages offer general planning questions only. They do not replace advice from a California attorney, tax professional, licensed real-estate professional, contractor, or other qualified adviser.</div></section><CTA /></main>; }

