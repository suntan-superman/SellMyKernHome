import Link from "next/link";
import { ArrowLeft, ClipboardCheck, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Property Intelligence Demonstration", robots: { index: false, follow: false, noarchive: true } };

const assumptions = [
  ["Scenario address", "1000 Example Avenue, Bakersfield, CA 93301"],
  ["Property", "Synthetic single-family home · 3 bed · 2 bath · 1,450 sq ft"],
  ["Condition", "Illustrative deferred maintenance; inspection not performed"],
  ["Illustrative reference value", "$320,000"],
  ["Illustrative repairs", "$55,000"],
  ["Illustrative holding and closing costs", "$25,000"],
  ["Illustrative contingency", "$10,000"],
];

export default async function PropertyIntelligencePage() {
  await requireAdmin();
  return <main id="main-content" className="admin-shell">
    <section className="admin-panel pi-demo-panel">
      <Link className="text-link" href="/admin"><ArrowLeft size={17} /> Admin overview</Link>
      <p className="eyebrow">MANUAL PI SCENARIO</p><h1>Synthetic Kern County property evaluation</h1>
      <p className="page-intro">No PI API or automated transfer is represented. This scenario contains no seller identity, contact details, private notes, production lead identifier, or live comparable-sale claim.</p>
      <div className="admin-detail-grid"><div><h2>Property-only handoff</h2><dl className="demo-assumptions">{assumptions.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div>
      <aside className="notice"><ClipboardCheck size={24} /><h2>Demonstration sequence</h2><ol><li>Open the separately approved PI environment.</li><li>Enter only the synthetic property facts shown here.</li><li>Label every comparable, repair, value, cost, margin, and simulation output as illustrative.</li><li>Present sensitivity ranges rather than an offer or promise.</li><li>Return to SMKH without copying seller PII.</li></ol></aside></div>
      <div className="demo-legal-note"><ShieldCheck /><div><h2>Required disclaimer</h2><p>Training scenario only. These values are invented assumptions, not an appraisal, market analysis, offer, investment recommendation, or representation of a real property or transaction.</p></div></div>
    </section>
  </main>;
}
