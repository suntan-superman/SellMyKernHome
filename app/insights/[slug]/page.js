import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import CTA from "@/components/CTA";
import JsonLd from "@/components/JsonLd";
import { articles, getArticle } from "@/content/articles";
import { SITE_NAME, absoluteUrl, buildPageMetadata } from "@/lib/site";

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const article = getArticle((await params).slug);
  if (!article) return {};
  const metadata = buildPageMetadata({ title: article.title, description: article.description, path: `/insights/${article.slug}`, indexable: article.approvedForIndexing, type: "article" });
  metadata.openGraph.modifiedTime = article.updated;
  return metadata;
}

export default async function ArticlePage({ params }) {
  const article = getArticle((await params).slug);
  if (!article) notFound();
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
      <section><h2>Authoritative resources</h2><ul className="source-links">{article.sources.map(([label, href]) => <li key={href}><a href={href} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></section>
      <section><h2>Related guides</h2><ul className="source-links">{article.related.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></section>
    </div></article>
    <CTA title="Want to discuss the property facts?" />
  </main>;
}
