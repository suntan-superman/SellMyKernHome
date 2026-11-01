import { redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { getAdminContext, safeAdminDestination } from "@/lib/admin-session";
import AdminPasswordField from "@/components/AdminPasswordField";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin Sign In", robots: { index: false, follow: false, noarchive: true } };

export default async function AdminLoginPage({ searchParams }) {
  if (await getAdminContext()) redirect("/admin");
  const query = await searchParams;
  const destination = safeAdminDestination(query?.next);
  return <main id="main-content" className="admin-login-page">
    <section className="admin-login-card" aria-labelledby="admin-login-title">
      <LockKeyhole size={34} aria-hidden="true" />
      <p className="eyebrow">SELL MY KERN HOME ADMIN</p>
      <h1 id="admin-login-title">Authorized access</h1>
      <p>Sign in with an approved Sell My Kern Home administrator account.</p>
      {query?.error === "invalid" ? <div className="form-alert" role="alert">The email or password was not accepted.</div> : null}
      {query?.error === "unauthorized" ? <div className="form-alert" role="alert">This account does not have an active Sell My Kern Home membership.</div> : null}
      <form method="post" action="/api/admin/login" className="admin-login-form">
        <input type="hidden" name="next" value={destination} />
        <label htmlFor="admin-email">Email address</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required />
        <AdminPasswordField />
        <button className="button" type="submit">Sign in</button>
      </form>
      <p className="admin-form-note">Access is authenticated through Supabase and restricted by independent SMKH membership.</p>
    </section>
  </main>;
}
