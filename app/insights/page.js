import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import PageHero from "@/components/PageHero";
import { articles } from "@/content/articles";

export const metadata = { title: "Property Insights", description: "Practical, compliance-conscious guides for Kern County property owners considering a sale.", alternates: { canonical: "/insights" } };
export default function InsightsPage() { return <main id="main-content"><PageHero eyebrow="INSIGHTS" title="Useful questions for a more informed property decision" intro="General educational material to help you organize a conversation—not legal, tax, financial, or real-estate advice." breadcrumbs={[{ label: "Insights" }]} /><section className="section content-shell article-grid">{articles.map((article) => <Link className="article-card" href={`/insights/${article.slug}`} key={article.slug}><p className="eyebrow">PROPERTY GUIDE</p><h2>{article.title}</h2><p>{article.description}</p><span className="text-link">Read the guide <ArrowUpRight size={17} /></span></Link>)}</section></main>; }

