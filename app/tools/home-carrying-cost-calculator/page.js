import Link from "next/link";
import CarryingCostCalculator from "@/components/CarryingCostCalculator";
import JsonLd from "@/components/JsonLd";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";
import PageHero from "@/components/PageHero";
import { SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

const path = "/tools/home-carrying-cost-calculator";
const title = "Home Carrying Cost Calculator | Bakersfield & Kern County";
const description = "Free home carrying cost calculator for Bakersfield homeowners. Estimate monthly mortgage, taxes, insurance, utilities, maintenance, and total holding costs.";

export const metadata = { ...buildPageMetadata({ title, description, path }), title: { absolute: title } };

export default function HomeCarryingCostCalculatorPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "Home Carrying Cost Calculator", description, url: absoluteUrl(path), applicationCategory: "FinanceApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript for interactive calculations", publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") } };
  return <main id="main-content" className="calculator-page carrying-page">
    <JsonLd data={schema} />
    <PageHero eyebrow="FREE HOME-SELLING TOOL" title="Home Carrying Cost Calculator" intro="Estimate how much it costs to keep your property each month and how those expenses add up while you decide when to sell." breadcrumbs={[{ href: "/insights", label: "Insights" }, { label: "Carrying Cost Calculator" }]} />
    <section className="calculator-introduction"><div className="content-shell"><p>Enter your own expenses and holding period to estimate cash outflow while you keep a property. The defaults are hypothetical examples—not Bakersfield averages or estimates for a particular home.</p></div></section>
    <div className="content-shell"><CarryingCostCalculator /></div>
    <section className="calculator-support content-shell" aria-label="Carrying cost guidance and disclosures"><details className="calculator-support-panel"><summary>What carrying costs can include</summary><div className="calculator-support-content definition-grid"><div><h2>Mortgage payment</h2><p>Monthly principal and interest or another required loan payment. Principal may reduce the outstanding loan balance, so cash paid is not necessarily the same as economic cost.</p></div><div><h2>Taxes and insurance</h2><p>Use separate monthly estimates only when they are not already included in the mortgage escrow amount entered above.</p></div><div><h2>Utilities and maintenance</h2><p>Electricity, gas, water, landscaping, repairs, security, and upkeep may continue while a property is occupied, vacant, prepared, or marketed.</p></div><div><h2>Cost of waiting</h2><p>A longer holding period increases estimated cash outflow. Compare that amount with preparation needs, timing preferences, likely proceeds, and complete written terms.</p></div></div></details><div className="calculator-operator-disclosure"><LeadGenerationDisclosure compact /></div><nav className="calculator-related" aria-label="Related property resources"><h2>Related resources</h2><ul className="related-links"><li><Link href="/tools/home-sale-net-proceeds-calculator">Home sale net proceeds calculator</Link></li><li><Link href="/tools/which-selling-option-fits-me">Selling Options Quiz</Link></li><li><Link href="/insights/sell-as-is-or-repair-bakersfield">Compare selling as-is with repairs</Link></li><li><Link href="/sell-your-house-bakersfield">Compare Bakersfield selling options</Link></li></ul></nav></section>
  </main>;
}
