export const SITE_URL = "https://sellmykernhome.com";
export const SITE_NAME = "Sell My Kern Home";
export const OPERATOR_NAME = "Workside Software";
export const OPERATOR_DISCLOSURE = "SellMyKernHome.com is a homeowner inquiry and lead-generation service operated by Workside Software. We are not a real estate brokerage or property buyer and do not represent buyers or sellers.";
export const SITE_DESCRIPTION = "Start a private conversation about selling a home in Bakersfield or Kern County. Share the property details and discuss possible next steps without pressure.";
export const BUSINESS_PHONE_DISPLAY = "(661) 518-2801";
export const BUSINESS_PHONE_E164 = "+16615182801";
export const BUSINESS_PHONE_HREF = `tel:${BUSINESS_PHONE_E164}`;
export const BUSINESS_PHONE_SERVICE_LABEL = "24/7 AI-assisted answering";

export function isIndexingEnabled() {
  return process.env.NEXT_PUBLIC_ROBOTS_INDEX === "true";
}

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

const socialImage = { url: "/images/craftsman-home-exterior-v2.webp", width: 1536, height: 1024, alt: "Blue-gray Craftsman-style home with a welcoming lit porch and landscaped front walk" };

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
