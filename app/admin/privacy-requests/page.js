import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { listPrivacyRequests } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacy Requests", robots: { index: false, follow: false, noarchive: true } };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Los_Angeles" }).format(new Date(value)) : "Unknown";
}

export default async function PrivacyRequestsAdminPage() {
  const context = await requireAdmin();
  const requests = await listPrivacyRequests(context);
  return <main id="main-content" className="admin-shell">
    <Link className="text-link" href="/admin"><ArrowLeft size={16} /> Back to leads</Link>
    <section className="admin-header"><div><p className="eyebrow">SELL MY KERN HOME ADMIN</p><h1>Privacy requests</h1><p><ShieldCheck size={17} /> Restricted to authorized SMKH administrators</p></div></section>
    <section className="admin-panel">
      <div className="admin-panel-heading"><div><h2>Do-not-sell-or-share preferences</h2><p>{requests.length} record{requests.length === 1 ? "" : "s"}</p></div></div>
      {requests.length ? <div className="admin-lead-list">{requests.map((request) => <article className="admin-lead-row" key={request.id}>
        <div><strong>{request.request_reference}</strong><span>{request.email || request.phone || "Contact verification pending"}</span><small>Requested {formatDate(request.requested_at)}</small></div>
        <div className="admin-lead-meta"><span className="status-pill">{request.status}</span><span>Suppression {request.suppression_active ? "active" : "inactive"}</span><span>{request.matched_lead_count} matching lead{request.matched_lead_count === 1 ? "" : "s"}</span>{request.prior_disclosure_follow_up_required ? <span>Prior-recipient follow-up required</span> : null}</div>
      </article>)}</div> : <p className="admin-empty">No privacy requests have been submitted.</p>}
    </section>
  </main>;
}
