export const SITE_URL = "https://sellmykernhome.com";
export const SITE_NAME = "Sell My Kern Home";
export const SITE_DESCRIPTION = "Start a private conversation about selling a home in Bakersfield or Kern County. Share the property details and discuss possible next steps without pressure.";

export function isIndexingEnabled() {
  return process.env.NEXT_PUBLIC_ROBOTS_INDEX === "true";
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

const socialImage = { url: "/images/modern-home-exterior.jpg", width: 1920, height: 1280, alt: "Contemporary home with clean lines and a landscaped front entry" };

export function buildPageMetadata({ title, description, path, indexable = true, type = "website" }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    openGraph: { type, locale: "en_US", siteName: SITE_NAME, title, description, url: path, images: [socialImage] },
    twitter: { card: "summary_large_image", title, description, images: [socialImage.url] },
  };
}
