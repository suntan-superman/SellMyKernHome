import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { articles, getArticle } from "@/content/articles";
import { SHORT_DISCLOSURE_TEXT } from "@/lib/disclosures";
import { SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.filter((article) => article.approvedForIndexing).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const article = getArticle((await params).slug);
  if (!article?.approvedForIndexing) return {};
  const metadata = buildPageMetadata({ title: article.metaTitle || article.title, description: article.description, path: `/insights/${article.slug}`, indexable: article.approvedForIndexing, type: "article" });
  if (article.metaTitle) metadata.title = { absolute: article.metaTitle };
  metadata.openGraph.modifiedTime = article.updated;
  return metadata;
}

export default async function ArticlePage({ params }) {
  const article = getArticle((await params).slug);
  if (!article?.approvedForIndexing) notFound();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    dateModified: article.updated,
    mainEntityOfPage: absoluteUrl(`/insights/${article.slug}`),
    author: { "@type": "Organization", name: `${SITE_NAME} editorial team` },
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
  };
  return <main id="main-content">
    <JsonLd data={schema} />
    <PageHero eyebrow="PROPERTY INSIGHTS" title={article.title} intro={article.description} breadcrumbs={[{ href: "/insights", label: "Insights" }, { label: article.title }]} />
    <article className="prose-section"><div className="prose-narrow">
      <p className="article-disclaimer">General educational information only—not legal, tax, financial, appraisal, or real-estate advice.</p>
      {article.sections.map(([heading, paragraphs]) => <section key={heading}><h2>{heading}</h2>{paragraphs.length > 2 && paragraphs.every((line) => line.endsWith("?") || line.length < 130) ? <ul>{paragraphs.map((line) => <li key={line}>{line}</li>)}</ul> : paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
      {article.comparison ? <section><h2>{article.comparison.title}</h2><div className="comparison-table-wrap" role="region" aria-label={article.comparison.title} tabIndex="0"><table><thead><tr><th scope="col">Comparison item</th>{article.comparison.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{article.comparison.rows.map(([item, ...values]) => <tr key={item}><th scope="row">{item}</th>{values.map((value, index) => <td key={`${item}-${article.comparison.columns[index]}`}>{value}</td>)}</tr>)}</tbody></table></div><p className="comparison-note">{article.comparison.note}</p></section> : null}
      {article.faq?.length ? <section><h2>Frequently asked questions</h2>{article.faq.map(([question, answer]) => <div key={question}><h3>{question}</h3><p>{answer}</p></div>)}</section> : null}
      <section><h2>Authoritative resources</h2><ul className="source-links">{article.sources.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></section>
      <section><h2>Related guides</h2><ul className="source-links">{article.related.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></section>
      <aside className="article-disclaimer"><strong>About this service:</strong> Sell My Kern Home is a homeowner inquiry and lead-generation service operated by Workside Software. {SHORT_DISCLOSURE_TEXT} <Link href="/how-it-works#sharing-disclosure">Read how the service works.</Link></aside>
    </div></article>
    <CTA title="Tell us about your property" />
  </main>;
}
