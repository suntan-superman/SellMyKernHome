import { Cormorant_Garamond, Manrope } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, isIndexingEnabled } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"], display: "swap" });

const indexable = isIndexingEnabled();

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Sell Your House in Bakersfield & Kern County | Sell My Kern Home", template: "%s | Sell My Kern Home" },
  description: SITE_DESCRIPTION,
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  alternates: { canonical: "/" },
  robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Selling a Home in Bakersfield or Kern County?",
    description: "Tell us about your property and what you hope to accomplish. We’ll review the details and contact you to discuss possible next steps.",
    images: [{ url: "/images/modern-home-exterior.jpg", width: 1920, height: 1280, alt: "Contemporary home with clean lines and a landscaped front entry" }],
  },
  twitter: { card: "summary_large_image", title: "Selling a Home in Bakersfield or Kern County?", description: SITE_DESCRIPTION, images: ["/images/modern-home-exterior.jpg"] },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <Analytics measurementId={gaId} />
      </body>
    </html>
  );
}

