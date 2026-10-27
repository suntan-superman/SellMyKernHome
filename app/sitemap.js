import { articles } from "@/content/articles";
import { sellerPages } from "@/content/seller-pages";
import { SITE_URL, isIndexingEnabled } from "@/lib/site";

const coreRoutes = ["", "/how-it-works", "/selling-situations", "/about", "/faq", "/contact", "/insights", "/selling-situations/vacant-property", "/selling-situations/relocating"];

export default function sitemap() {
  if (!isIndexingEnabled()) return [];
  const dated = (path, priority = 0.7) => ({ url: `${SITE_URL}${path}`, lastModified: "2026-10-14", changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : priority });
  return [
    ...coreRoutes.map((route) => dated(route)),
    ...Object.entries(sellerPages).filter(([, page]) => page.approvedForIndexing).map(([slug]) => dated(`/${slug}`, 0.8)),
    ...articles.filter((article) => article.approvedForIndexing).map((article) => ({ url: `${SITE_URL}/insights/${article.slug}`, lastModified: article.updated, changeFrequency: "monthly", priority: 0.65 })),
  ];
}
