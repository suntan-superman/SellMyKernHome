import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadGenerationDisclosure from "@/components/LeadGenerationDisclosure";
import PageHero from "@/components/PageHero";
import SellingOptionsQuiz from "@/components/SellingOptionsQuiz";
import { SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

const path = "/tools/which-selling-option-fits-me";
const title = "Which Home Selling Option Fits Me? | Bakersfield CA";
const description = "Take our free home selling quiz to explore listing, selling as-is, and other options for your Bakersfield or Kern County property.";

export const metadata = { ...buildPageMetadata({ title, description, path }), title: { absolute: title } };

export default function SellingOptionsQuizPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "Which Selling Option Fits Me?", description, url: absoluteUrl(path), applicationCategory: "EducationalApplication", operatingSystem: "Any", browserRequirements: "Requires JavaScript for the interactive quiz", publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") } };
  return <main id="main-content" className="quiz-page">
    <JsonLd data={schema} />
    <PageHero eyebrow="FREE HOME-SELLING TOOL" title="Which Selling Option Fits Me?" intro="Answer six quick questions about your property and priorities to explore selling approaches that may fit your situation." breadcrumbs={[{ href: "/insights", label: "Insights" }, { label: "Selling Options Quiz" }]} />
    <section className="quiz-introduction"><div className="content-shell"><p>The quiz runs entirely in your browser, requires no personal information, and does not save or transmit your answers. It offers educational paths to explore—not a valuation or transaction recommendation.</p></div></section>
    <div className="content-shell"><SellingOptionsQuiz /></div>
    <section className="quiz-approaches content-shell"><div><p className="eyebrow">POSSIBLE APPROACHES</p><h2>What the quiz helps you compare</h2><p>A property&apos;s condition, timing, ownership, occupancy, existing obligations, and your priorities can shape the questions worth asking. No single factor automatically determines the appropriate path.</p></div><div className="quiz-approach-grid"><article><h3>Traditional listing</h3><p>A licensed agent may help evaluate preparation, pricing, market exposure, likely expenses, and written listing terms. A listing does not guarantee a higher price or timeline.</p></article><article><h3>Selling as-is</h3><p>Some buyers consider properties in their current condition. Compare qualifications, price, inspections, contingencies, assignment rights, costs, and proposed timing.</p></article><article><h3>Clarify authority first</h3><p>When ownership or estate authority is uncertain, qualified professionals can help identify who may make decisions and which process or records apply.</p></article><article><h3>Compare multiple paths</h3><p>Mixed priorities may call for written estimates and side-by-side comparisons rather than a single answer. Consider net proceeds and responsibilities—not only price.</p></article></div></section>
    <section className="calculator-support content-shell"><div className="calculator-operator-disclosure"><LeadGenerationDisclosure compact /></div><nav className="calculator-related" aria-label="Related property resources"><h2>Related resources</h2><ul className="related-links"><li><Link href="/tools/home-sale-net-proceeds-calculator">Home sale net proceeds calculator</Link></li><li><Link href="/sell-your-house-bakersfield">Compare Bakersfield selling options</Link></li><li><Link href="/sell-house-as-is-bakersfield">Selling a house as-is</Link></li><li><Link href="/contact">Contact Sell My Kern Home</Link></li></ul></nav></section>
  </main>;
}
