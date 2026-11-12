import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/admin-session";
import AdminSiteContent from "@/components/AdminSiteContent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site Content | Sell My Kern Home Admin", robots: { index: false, follow: false, noarchive: true } };

export default async function ContentPage() {
  const context = await requireAdmin(["owner", "admin"]);
  return <main id="main-content" className="admin-shell"><div className="admin-back-row"><Link className="text-link" href="/admin"><ArrowLeft size={17}/> Admin overview</Link><span><ShieldCheck size={16}/> {context.displayName} · {context.role}</span></div><section className="admin-header"><div><p className="eyebrow">SELL MY KERN HOME ADMIN</p><h1>Site content</h1><p>Update the homepage image and manage customer testimonials.</p></div></section><AdminSiteContent/></main>;
}
