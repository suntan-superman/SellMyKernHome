import Link from "next/link";
import { ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { requireDemoAccess } from "@/lib/demo-access";
import { isDemoMode } from "@/lib/runtime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Synthetic Property Intelligence Scenario", robots: { index: false, follow: false, noarchive: true } };

const assumptions = [
  ["Scenario address", "1000 Example Avenue, Bakersfield, CA 93301"],
  ["Property", "Synthetic single-family home • 3 bed • 2 bath • 1,450 sq ft"],
  ["Condition", "Illustrative deferred maintenance; inspection not performed"],
  ["Illustrative reference value", "$320,000"],
  ["Illustrative repairs", "$55,000"],
  ["Illustrative holding and closing costs", "$25,000"],
  ["Illustrative contingency", "$10,000"],
];

export default async function PropertyIntelligenceDemoPage() {
  if (!isDemoMode()) notFound();
  await requireDemoAccess();
  return <main id="main-content" className="demo-shell">
    <section className="page-hero"><div className="content-shell prose-narrow">
      <Link className="text-link" href="/demo"><ArrowLeft size={17} /> Demonstration overview</Link>
      <p className="eyebrow">MANUAL PI SCENARIO</p><h1>Synthetic Kern County property evaluation</h1>
      <p className="page-intro">This scenario contains no seller name, email, telephone number, private notes, production lead identifier, or live comparable-sale claim.</p>
    </div></section>
    <section className="section content-shell situation-detail">
      <div><h2>Property-only handoff</h2><dl className="demo-assumptions">{assumptions.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
      <aside className="notice"><ClipboardCheck size={24} /><h2>Demonstration sequence</h2><ol><li>Open the approved PI environment separately.</li><li>Enter only the synthetic property facts shown here.</li><li>Label every comparable, repair, value, cost, margin, and simulation output as illustrative.</li><li>Present sensitivity ranges rather than an offer or promise.</li><li>Return to SMKH without copying seller PII.</li></ol></aside>
    </section>
    <section className="section content-shell"><div className="demo-legal-note"><ShieldCheck /><div><h2>Required disclaimer</h2><p>Training scenario only. These values are invented assumptions, not an appraisal, market analysis, offer, investment recommendation, or representation of a real property or transaction.</p></div></div></section>
  </main>;
}
