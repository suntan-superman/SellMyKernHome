import { SITE_URL, isIndexingEnabled } from "@/lib/site";

export default function robots() {
  const indexable = isIndexingEnabled();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you"] },
    sitemap: indexable ? `${SITE_URL}/sitemap.xml` : undefined,
  };
}

