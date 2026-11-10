import PageHero from "@/components/PageHero";
import PrivacyRequestForm from "@/components/PrivacyRequestForm";
import { getSellerFormConfiguration } from "@/lib/form-config";
import { buildPageMetadata } from "@/lib/site";

export const metadata = buildPageMetadata({ title: "Privacy Choices", description: "Submit a Sell My Kern Home do-not-sell-or-share privacy preference.", path: "/privacy-choices", indexable: false });

export default function PrivacyChoicesPage() {
  const form = getSellerFormConfiguration();
  return <main id="main-content">
    <PageHero eyebrow="PRIVACY CHOICES" title="Control future sharing of your information" intro="Workside Software provides a direct way to record a do-not-sell-or-share preference without submitting a new property inquiry." breadcrumbs={[{ label: "Privacy Choices" }]} />
    <section className="prose-section"><div className="prose-narrow"><PrivacyRequestForm turnstileSiteKey={form.turnstileSiteKey} /></div></section>
  </main>;
}
