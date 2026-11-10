import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";
import NetProceedsCalculator from "@/components/NetProceedsCalculator";
import PageHero from "@/components/PageHero";
import RelatedResources from "@/components/RelatedResources";
import { SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

const path = "/tools/home-sale-net-proceeds-calculator";
const title = "Home Sale Net Proceeds Calculator | Bakersfield CA";
const description = "Free Bakersfield home sale proceeds calculator. Compare estimated as-is selling proceeds with repairing and listing. Adjust costs and see the difference.";

export const metadata = {
  ...buildPageMetadata({ title, description, path }),
  title: { absolute: title },
};

export default function NetProceedsCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Home Sale Net Proceeds Calculator",
    description,
    url: absoluteUrl(path),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript for interactive calculations",
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  };
  return <main id="main-content">
    <JsonLd data={schema} />
    <PageHero eyebrow="FREE HOME-SELLING TOOL" title="Free Home Sale Net Proceeds Calculator" intro="Compare estimated proceeds from repairing and listing your home versus selling it as-is. Adjust the numbers to explore how repairs, selling expenses, and carrying costs affect your results." breadcrumbs={[{ href: "/insights", label: "Insights" }, { label: "Net Proceeds Calculator" }]} />
    <section className="prose-section calculator-introduction"><div className="prose-narrow"><h2>Compare two possible paths using your own assumptions</h2><p>This educational calculator subtracts estimated repair, selling, carrying, and payoff amounts from the sale prices you enter. It shows both estimated cash proceeds and the difference between the two scenarios. The default numbers are hypothetical examples—not Bakersfield market valuations or actual offers.</p><p>Use the result as a starting point for questions and written estimates, not as a substitute for an appraisal, closing statement, or advice about a particular transaction.</p></div></section>
    <div className="content-shell"><NetProceedsCalculator /></div>
    <section className="prose-section"><div className="prose-narrow"><h2>What each input means</h2><h3>Selling expenses</h3><p>Costs associated with a sale may include negotiable real-estate commissions, closing services, credits, and other transaction expenses. The applicable items and amounts depend on the agreement.</p><h3>Repair budget</h3><p>The estimated cost of work completed before marketing or closing. Consider independent estimates and the possibility that project scope may change.</p><h3>Carrying costs</h3><p>Expenses incurred while owning the property before closing, such as utilities, insurance, taxes, maintenance, financing, or security. Include only costs relevant to your comparison.</p><h3>Mortgage and lien payoff</h3><p>Amounts that may need to be paid from sale proceeds. Applying the same payoff to both scenarios lowers both estimated cash results equally, so it does not by itself change which scenario is higher.</p></div></section>
    <section className="prose-section calculator-faq"><div className="prose-narrow"><h2>Calculator FAQ</h2><h3>Does the higher sale price always produce more proceeds?</h3><p>No. Repair costs, selling expenses, carrying costs, credits, and payoffs can reduce the amount remaining after a sale. Compare the itemized estimates and complete written terms.</p><h3>Are the default percentages customary or recommended?</h3><p>No. They are hypothetical examples only. Enter assumptions that reflect the written estimates and options you are evaluating. Selling expenses and real-estate commissions are negotiable.</p><h3>Does Sell My Kern Home receive my calculator entries?</h3><p>No. The calculator runs in your browser and does not automatically collect, save, transmit, or associate the values with you. If you separately choose to submit the existing property inquiry form, only the information you enter into that form is submitted under its displayed consent choices.</p><h3>Is this an appraisal or offer?</h3><p>No. It is an educational comparison tool, not an appraisal, valuation, purchase offer, guarantee, or professional advice.</p><p>For additional context, read <Link href="/insights/sell-as-is-or-repair-bakersfield">Sell As-Is or Make Repairs? A Bakersfield Homeowner&apos;s Guide</Link>.</p></div></section>
    <section className="prose-section"><div className="prose-narrow"><LeadGenerationDisclosure compact /></div></section>
    <RelatedResources links={[["/insights/sell-as-is-or-repair-bakersfield", "Compare selling as-is with making repairs"], ["/sell-house-as-is-bakersfield", "Selling a Bakersfield house as-is"], ["/sell-your-house-bakersfield", "Compare Bakersfield home-selling options"], ["/contact", "Start a private property inquiry"]]} />
  </main>;
}
