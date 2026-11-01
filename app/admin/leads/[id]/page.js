import Link from "next/link";
import { ArrowLeft, Bell, Clock3, History, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import AdminLeadForm from "@/components/AdminLeadForm";
import { getAdminLead } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-session";
import { statusLabel } from "@/lib/admin-shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead Detail", robots: { index: false, follow: false, noarchive: true } };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Los_Angeles" }).format(new Date(value)) : "Not recorded";
}

function display(value) { return value || "Not provided"; }

export default async function AdminLeadPage({ params }) {
  const context = await requireAdmin();
  const { id } = await params;
  const result = await getAdminLead(context, id);
  if (!result) notFound();
  const { lead, events, notifications } = result;
  const canEdit = ["owner", "admin", "operator"].includes(context.role);
  return <main id="main-content" className="admin-shell">
    <div className="admin-back-row"><Link className="text-link" href="/admin"><ArrowLeft size={17} /> All leads</Link><form method="post" action="/api/admin/logout"><button className="text-button" type="submit">Sign out</button></form></div>
    <section className="admin-detail-heading"><div><p className="eyebrow">{lead.reference}</p><h1>{lead.first_name} {lead.last_name}</h1><p>{lead.property_address}, {lead.property_city}, {lead.property_zip}</p></div><span className={`status-pill status-${lead.status}`}>{statusLabel(lead.status)}</span></section>
    {lead.legacy_status ? <div className="admin-history-notice"><History size={18} /><span>Preserved historical SMKH record. Original workflow status: <strong>{lead.legacy_status}</strong>.</span></div> : null}
    <div className="admin-detail-grid">
      <section className="admin-panel admin-lead-information">
        <h2>Inquiry details</h2>
        <dl className="admin-definition-list">
          <div><dt>Preferred contact</dt><dd>{statusLabel(lead.preferred_contact)}</dd></div>
          <div><dt>Email</dt><dd>{display(lead.email)}</dd></div>
          <div><dt>Phone</dt><dd>{display(lead.phone)}</dd></div>
          <div><dt>Property type</dt><dd>{display(lead.property_type)}</dd></div>
          <div><dt>Condition</dt><dd>{display(lead.property_condition)}</dd></div>
          <div><dt>Occupancy</dt><dd>{display(lead.occupancy)}</dd></div>
          <div><dt>Desired timing</dt><dd>{display(lead.desired_timing)}</dd></div>
          <div><dt>Submitted</dt><dd>{formatDate(lead.created_at)}</dd></div>
        </dl>
        <h3>Seller message</h3><p className="admin-message-copy">{display(lead.message)}</p>
        <div className="admin-pi-boundary"><ShieldCheck size={20} /><div><strong>Property Intelligence boundary</strong><p>Do not transfer this seller&apos;s identity, contact details, notes, or address to PI without separate authorization. Use the synthetic demonstration instead.</p><Link className="text-link" href="/admin/property-intelligence">Open synthetic PI demonstration</Link></div></div>
      </section>
      <aside className="admin-panel"><h2>Follow-up</h2><AdminLeadForm lead={lead} canEdit={canEdit} /></aside>
    </div>
    <div className="admin-detail-grid admin-history-grid">
      <section className="admin-panel"><h2><Clock3 size={20} /> Audit history</h2>{events.length ? <ol className="admin-timeline">{events.map((event) => <li key={event.id}><div><strong>{statusLabel(event.action)}</strong><span>{formatDate(event.created_at)}</span></div><p>{event.after_state?.status ? `Status: ${statusLabel(event.after_state.status)}. ` : ""}{event.after_state?.notes_changed ? "Internal notes changed. " : ""}Attributed to {event.actor_kind}{event.actor_id ? ` (${event.actor_id.slice(0, 8)}…)` : ""}.</p></li>)}</ol> : <p>No audit events recorded.</p>}</section>
      <section className="admin-panel"><h2><Bell size={20} /> Notifications</h2>{notifications.length ? <ol className="admin-timeline">{notifications.map((item) => <li key={item.id}><div><strong>{statusLabel(item.status)}</strong><span>{formatDate(item.attempted_at)}</span></div><p>Email notification{item.error_code ? ` · ${item.error_code}` : ""}</p></li>)}</ol> : <p>No notification attempts recorded.</p>}</section>
    </div>
  </main>;
}
