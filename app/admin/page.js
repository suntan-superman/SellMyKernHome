import Link from "next/link";
import { CalendarClock, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import { listAdminLeads } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/admin-session";
import { leadStatuses, statusLabel } from "@/lib/admin-shared";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead Admin", robots: { index: false, follow: false, noarchive: true } };

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Los_Angeles" }).format(new Date(value)) : "Not scheduled";
}

export default async function AdminPage({ searchParams }) {
  const context = await requireAdmin();
  const query = await searchParams;
  const { leads, status } = await listAdminLeads(context, query?.status);
  return <main id="main-content" className="admin-shell">
    <section className="admin-header"><div><p className="eyebrow">SELL MY KERN HOME ADMIN</p><h1>Seller leads</h1><p><ShieldCheck size={17} /> Signed in as {context.displayName} · {statusLabel(context.role)}</p></div><form method="post" action="/api/admin/logout"><button className="button button-secondary" type="submit"><LogOut size={17} /> Sign out</button></form></section>
    <nav className="admin-filters" aria-label="Lead status filters">
      <Link className={!status ? "active" : ""} href="/admin">All</Link>
      {leadStatuses.map((item) => <Link className={status === item ? "active" : ""} href={`/admin?status=${item}`} key={item}>{statusLabel(item)}</Link>)}
    </nav>
    <section className="admin-panel">
      <div className="admin-panel-heading"><div><h2>{status ? statusLabel(status) : "All leads"}</h2><p>{leads.length} record{leads.length === 1 ? "" : "s"}</p></div><div className="admin-heading-links"><Link className="text-link" href="/admin/content">Site content</Link><Link className="text-link" href="/admin/privacy-requests">Privacy requests</Link><Link className="text-link" href="/admin/property-intelligence">PI demonstration</Link></div></div>
      {leads.length ? <div className="admin-lead-list">{leads.map((lead) => <Link href={`/admin/leads/${lead.id}`} className="admin-lead-row" key={lead.id}>
        <div><strong>{lead.first_name} {lead.last_name}</strong><span>{lead.property_address}, {lead.property_city} {lead.property_zip}</span><small>{lead.reference}</small></div>
        <div className="admin-lead-meta"><span className={`status-pill status-${lead.status}`}>{statusLabel(lead.status)}</span><span><CalendarClock size={15} /> {formatDate(lead.follow_up_at)}</span>{lead.archived_at ? <span>Historical archived record</span> : null}</div>
        <ChevronRight aria-hidden="true" />
      </Link>)}</div> : <p className="admin-empty">No leads match this filter.</p>}
    </section>
  </main>;
}
