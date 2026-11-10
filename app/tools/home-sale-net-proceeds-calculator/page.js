import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";
import NetProceedsCalculator from "@/components/NetProceedsCalculator";
import PageHero from "@/components/PageHero";
import { SHORT_DISCLOSURE_TEXT } from "@/lib/disclosures";
import { OPERATOR_DISCLOSURE, SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

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
  return <main id="main-content" className="calculator-page">
    <JsonLd data={schema} />
    <PageHero eyebrow="FREE HOME-SELLING TOOL" title="Free Home Sale Net Proceeds Calculator" intro="Compare estimated proceeds from repairing and listing your home versus selling it as-is. Adjust the numbers to explore how repairs, selling expenses, and carrying costs affect your results." breadcrumbs={[{ href: "/insights", label: "Insights" }, { label: "Net Proceeds Calculator" }]} />
    <section className="calculator-introduction"><div className="content-shell"><p>Enter your own assumptions to compare estimated proceeds. The defaults are hypothetical examples—not Bakersfield market valuations or actual offers.</p></div></section>
    <div className="content-shell"><NetProceedsCalculator /></div>
    <section className="calculator-support content-shell" aria-label="Calculator guidance and disclosures">
      <details className="calculator-support-panel"><summary>How the calculator works and input definitions</summary><div className="calculator-support-content"><p>This educational calculator subtracts estimated repair, selling, carrying, and payoff amounts from the sale prices you enter. It shows both estimated cash proceeds and the difference between the scenarios. Use the result as a starting point for questions and written estimates—not as an appraisal, closing statement, or advice about a particular transaction.</p><div className="definition-grid"><div><h2>Selling expenses</h2><p>Costs associated with a sale may include negotiable real-estate commissions, closing services, credits, and other transaction expenses. The applicable items and amounts depend on the agreement.</p></div><div><h2>Repair budget</h2><p>The estimated cost of work completed before marketing or closing. Consider independent estimates and the possibility that project scope may change.</p></div><div><h2>Carrying costs</h2><p>Expenses incurred while owning the property before closing, such as utilities, insurance, taxes, maintenance, financing, or security. Include only costs relevant to your comparison.</p></div><div><h2>Mortgage and lien payoff</h2><p>Amounts that may need to be paid from sale proceeds. Applying the same payoff to both scenarios lowers both estimated cash results equally, so it does not by itself change which scenario is higher.</p></div></div></div></details>
      <details className="calculator-support-panel"><summary>Calculator FAQ</summary><div className="calculator-support-content faq-grid"><div><h2>Does the higher sale price always produce more proceeds?</h2><p>No. Repair costs, selling expenses, carrying costs, credits, and payoffs can reduce the amount remaining after a sale. Compare the itemized estimates and complete written terms.</p></div><div><h2>Are the default percentages customary or recommended?</h2><p>No. They are hypothetical examples only. Enter assumptions that reflect the written estimates and options you are evaluating. Selling expenses and real-estate commissions are negotiable.</p></div><div><h2>Does Sell My Kern Home receive my calculator entries?</h2><p>No. The calculator runs in your browser and does not automatically collect, save, transmit, or associate the values with you. If you separately submit the existing property inquiry form, only the information entered there is submitted under its displayed consent choices.</p></div><div><h2>Is this an appraisal or offer?</h2><p>No. It is an educational comparison tool, not an appraisal, valuation, purchase offer, guarantee, or professional advice.</p></div><p>For additional context, read <Link href="/insights/sell-as-is-or-repair-bakersfield">Sell As-Is or Make Repairs? A Bakersfield Homeowner&apos;s Guide</Link>.</p></div></details>
      <div className="calculator-operator-disclosure"><p><strong>About this service:</strong> {OPERATOR_DISCLOSURE}</p><p>{SHORT_DISCLOSURE_TEXT}</p><details><summary>Who we are and how this site works</summary><div className="calculator-support-content"><LeadGenerationDisclosure compact /></div></details></div>
      <nav className="calculator-related" aria-label="Related property resources"><h2>Related resources</h2><ul className="related-links"><li><Link href="/insights/sell-as-is-or-repair-bakersfield">Compare selling as-is with making repairs</Link></li><li><Link href="/sell-house-as-is-bakersfield">Selling a Bakersfield house as-is</Link></li><li><Link href="/sell-your-house-bakersfield">Compare Bakersfield home-selling options</Link></li><li><Link href="/contact">Start a private property inquiry</Link></li></ul></nav>
    </section>
  </main>;
}
