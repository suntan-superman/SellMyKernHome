import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import RelatedResources from "@/components/RelatedResources";
import { getSituation, situations } from "@/content/situations";
import { buildPageMetadata } from "@/lib/site";

function isDedicatedSituationPage(item) { return item?.href === `/selling-situations/${item.slug}`; }

export const dynamicParams = false;
export function generateStaticParams() { return situations.filter(isDedicatedSituationPage).map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }) { const item = getSituation((await params).slug); if (!isDedicatedSituationPage(item)) return {}; return buildPageMetadata({ title: item.metaTitle || `${item.title} in Kern County`, description: item.metaDescription || item.intro, path: item.href }); }

export default async function SituationPage({ params }) {
  const item = getSituation((await params).slug); if (!isDedicatedSituationPage(item)) notFound();
  return <main id="main-content"><PageHero eyebrow="SELLING SITUATIONS" title={item.pageTitle || item.title} intro={item.intro} breadcrumbs={[{ href: "/selling-situations", label: "Selling Situations" }, { label: item.title }]} /><section className="section content-shell situation-detail"><div><p className="eyebrow">BEFORE THE CONVERSATION</p><h2>Questions worth organizing</h2><ul className="check-list">{item.points.map((point) => <li key={point}><CheckCircle2 size={19} /> {point}</li>)}</ul></div><aside className="notice"><h3>A practical boundary</h3><p>{item.note}</p></aside></section><section className="prose-section"><div className="prose-narrow"><h2>You can start without having every answer</h2><p>A property decision often involves information you are still gathering. Share what you know, identify what is uncertain, and avoid sending sensitive documents through the website. A first conversation can help clarify which questions need attention next.</p><p>No sale path, price, timeline, or outcome is represented or guaranteed by this page.</p></div></section><RelatedResources links={item.related} /><CTA /></main>;
}

