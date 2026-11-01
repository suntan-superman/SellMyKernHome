import { SITE_URL, isIndexingEnabled } from "@/lib/site";

export default function robots() {
  const indexable = isIndexingEnabled();
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: indexable ? `${SITE_URL}/sitemap.xml` : undefined,
  };
}

