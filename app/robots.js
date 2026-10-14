export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const indexable = process.env.NEXT_PUBLIC_ROBOTS_INDEX === "true";
  return { rules: indexable ? { userAgent: "*", allow: "/", disallow: ["/api/", "/thank-you"] } : { userAgent: "*", disallow: "/" }, sitemap: indexable ? `${base}/sitemap.xml` : undefined };
}

