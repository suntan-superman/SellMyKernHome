import { Cormorant_Garamond, Manrope } from "next/font/google";
import Script from "next/script";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";
import "./globals.css";

const display = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"], display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Sell My Kern Home | A Thoughtful Way to Discuss Your Property", template: "%s | Sell My Kern Home" },
  description: "Start a private conversation about selling a home in Bakersfield or Kern County. Share the property details and discuss possible next steps without pressure.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Sell My Kern Home",
    title: "Thinking About Selling Your Kern County Home?",
    description: "Tell us about your property and what you hope to accomplish. We’ll review the details and contact you to discuss possible next steps.",
    images: [{ url: "/images/bakersfield-home.jpg", width: 1600, height: 1069, alt: "A residential home in Bakersfield, California" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        {children}
        <Footer />
        <Analytics />
        {gaId ? <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{send_page_view:true,allow_google_signals:false});`}</Script>
        </> : null}
      </body>
    </html>
  );
}

