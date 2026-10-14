import { articles } from "@/content/articles";
import { situations } from "@/content/situations";

export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const routes = ["", "/how-it-works", "/selling-situations", "/about", "/faq", "/contact", "/insights"];
  return [
    ...routes.map((route) => ({ url: `${base}${route}`, lastModified: "2026-10-14", changeFrequency: route === "" ? "weekly" : "monthly", priority: route === "" ? 1 : .7 })),
    ...situations.map(({ slug }) => ({ url: `${base}/selling-situations/${slug}`, lastModified: "2026-10-14", changeFrequency: "monthly", priority: .7 })),
    ...articles.map(({ slug, published }) => ({ url: `${base}/insights/${slug}`, lastModified: published, changeFrequency: "monthly", priority: .65 })),
  ];
}

