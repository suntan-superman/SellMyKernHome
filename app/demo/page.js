import Link from "next/link";
import { ArrowRight, BarChart3, Database, LockKeyhole, Workflow } from "lucide-react";
import { notFound } from "next/navigation";
import { requireDemoAccess } from "@/lib/demo-access";
import { isDemoMode } from "@/lib/runtime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Adam Partnership Demonstration", robots: { index: false, follow: false, noarchive: true } };

export default async function DemoPage() {
  if (!isDemoMode()) notFound();
  await requireDemoAccess();
  return <main id="main-content" className="demo-shell">
    <section className="page-hero demo-hero"><div className="content-shell">
      <p className="eyebrow">WORKSIDE-CONTROLLED PRIVATE STAGING</p>
      <h1>Sell My Kern Home partnership demonstration</h1>
      <p className="page-intro">Sell My Kern Home remains the consumer brand. This restricted workspace demonstrates a proposed behind-the-scenes operating workflow using synthetic information only.</p>
      <div className="demo-banner"><LockKeyhole size={18} /><span>Private staging • no production data • no live outreach • analytics disabled</span></div>
    </div></section>
    <section className="section content-shell">
      <div className="section-heading"><div><p className="eyebrow">DEMONSTRATION MAP</p><h2>Prepared pathways</h2></div><p>Phase B establishes the isolated architecture and access boundary. External services and operator accounts remain intentionally unprovisioned.</p></div>
      <div className="demo-card-grid">
        <article><Database /><h3>Independent lead data</h3><p>An isolated SMKH schema supports synthetic leads, assignments, notes, follow-up dates, audit history, and notification records.</p><span className="demo-status">Schema prepared locally</span></article>
        <article><Workflow /><h3>Admin workflow</h3><p>The membership and trusted-mutation model is designed. Admin UI and a real Supabase Auth account require later approval and staging provisioning.</p><span className="demo-status">Provisioning blocked by gate</span></article>
        <article><BarChart3 /><h3>Property Intelligence</h3><p>A property-only synthetic scenario is ready for a manual demonstration without transferring seller identity or contact information.</p><Link className="text-link" href="/demo/property-intelligence">Open the PI scenario <ArrowRight size={17} /></Link></article>
      </div>
      <div className="demo-actions"><Link className="button" href="/">Review the consumer experience</Link><form method="post" action="/api/demo-access/logout"><button className="button button-secondary" type="submit">End private session</button></form></div>
    </section>
  </main>;
}
