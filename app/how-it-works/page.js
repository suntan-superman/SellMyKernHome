import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import Process from "@/components/Process";
import CTA from "@/components/CTA";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "How It Works", description: "See how a private Kern County property inquiry moves from a few basic details to a conversation about possible next steps.", path: "/how-it-works" });

export default function HowItWorksPage() { return <main id="main-content">
  <PageHero eyebrow="A CLEAR BEGINNING" title="A simple way to start a property conversation" intro="You do not need to prepare a sales pitch or decide on a transaction path before reaching out. Begin with the facts you know." breadcrumbs={[{ label: "How It Works" }]} />
  <section className="section content-shell"><Process /></section>
  <section className="prose-section"><div className="content-shell situation-detail"><div><p className="eyebrow">WHAT HELPS</p><h2>Details that make the first conversation useful</h2><p>Start with the property address, the best way to reach you, and the broad situation. Additional details are optional and can be discussed later.</p><ul className="check-list">{["Who is involved in the property decision", "Whether the home is occupied", "Known repairs or property concerns", "Your timing, priorities, and questions", "Any documents you already have and want to discuss"].map((item) => <li key={item}><CheckCircle2 size={19} /> {item}</li>)}</ul></div><aside className="notice"><h3>Keep sensitive details private</h3><p>Do not send bank information, mortgage balances, Social Security numbers, access codes, or legal documents through the inquiry form.</p></aside></div></section>
  <section className="prose-section"><div className="prose-narrow"><h2>What this inquiry does—and does not—mean</h2><p>Submitting the form asks the GNZ team to review the information and contact you. It does not create a representation agreement, purchase contract, agency relationship, or obligation to continue.</p><p>Any potential transaction structure, timeline, costs, disclosures, or professional roles must be discussed and documented separately. You may seek independent legal, tax, real-estate, or financial advice at any point.</p></div></section><CTA />
</main>; }

