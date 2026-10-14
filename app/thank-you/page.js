import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "Inquiry Received", robots: { index: false, follow: false } };
export default async function ThankYouPage({ searchParams }) { const reference = (await searchParams).reference; return <main id="main-content"><section className="page-hero"><div className="content-shell prose-narrow"><CheckCircle2 size={48} color="#145d49" /><p className="eyebrow">INQUIRY RECEIVED</p><h1>Thank you for sharing your property details.</h1><p className="page-intro">The GNZ team can now review what you sent and use your preferred method to contact you. No obligation or agreement was created by this submission.</p>{reference ? <p><strong>Your reference:</strong> {String(reference).slice(0,40)}</p> : null}<p>Please do not send sensitive financial, access, or legal information in a follow-up message.</p><Link className="button" href="/">Return home</Link></div></section></main>; }

