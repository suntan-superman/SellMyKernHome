import { LockKeyhole, ShieldCheck } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSafeDemoAccessStatus, hasDemoAccess, safeDemoDestination } from "@/lib/demo-access";
import { isDemoMode } from "@/lib/runtime";

export const dynamic = "force-dynamic";
export const metadata = { title: "Private Demonstration Access", robots: { index: false, follow: false, noarchive: true } };

export default async function DemoAccessPage({ searchParams }) {
  if (!isDemoMode()) notFound();
  if (await hasDemoAccess()) redirect("/demo");
  const query = await searchParams;
  const destination = safeDemoDestination(query?.next);
  const status = getSafeDemoAccessStatus();

  return <main id="main-content" className="demo-access-page">
    <section className="demo-access-card" aria-labelledby="demo-access-title">
      <span className="demo-lock" aria-hidden="true"><LockKeyhole /></span>
      <p className="eyebrow">PRIVATE PARTNERSHIP PREVIEW</p>
      <h1 id="demo-access-title">Sell My Kern Home demonstration</h1>
      <p>This staging environment is restricted. Use only the review credentials supplied by Workside through an approved private channel.</p>
      {!status.configured ? <div className="form-alert" role="alert">Private staging access is not configured. No credentials have been provisioned.</div> : null}
      {query?.error === "invalid" ? <div className="form-alert" role="alert">The access credentials were not accepted.</div> : null}
      <form method="post" action="/api/demo-access/login" className="demo-access-form">
        <input type="hidden" name="next" value={destination} />
        <label htmlFor="demo-username">Review username</label>
        <input id="demo-username" name="username" autoComplete="username" required disabled={!status.configured} />
        <label htmlFor="demo-password">Review password</label>
        <input id="demo-password" name="password" type="password" autoComplete="current-password" required disabled={!status.configured} />
        <button className="button" type="submit" disabled={!status.configured}>Open private preview</button>
      </form>
      <p className="demo-access-note"><ShieldCheck size={17} /> Access is session-limited, server-verified, and excluded from indexing.</p>
    </section>
  </main>;
}
