import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { articles } from "@/content/articles";

function formatArticleDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function ArticleCards({ limit }) {
  const publishedArticles = articles
    .filter((article) => article.approvedForIndexing)
    .sort((left, right) => right.updated.localeCompare(left.updated));
  const visibleArticles = typeof limit === "number" ? publishedArticles.slice(0, limit) : publishedArticles;

  return <div className="article-card-grid">
    {visibleArticles.map((article) => <article className="article-card" key={article.slug}>
      <p className="article-card-meta">Homeowner guide · <time dateTime={article.updated}>{formatArticleDate(article.updated)}</time></p>
      <h3><Link href={`/insights/${article.slug}`}>{article.title}</Link></h3>
      <p>{article.description}</p>
      <Link className="text-link" href={`/insights/${article.slug}`}>Read the guide <ArrowRight size={17} /></Link>
    </article>)}
  </div>;
}
