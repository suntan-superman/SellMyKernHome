import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return <footer className="site-footer">
    <div className="footer-grid">
      <div className="footer-brand"><Logo light /><p>A local property conversation for Bakersfield and Kern County, affiliated with GNZ Marketing.</p></div>
      <div><h2>Explore</h2><Link href="/how-it-works">How It Works</Link><Link href="/selling-situations">Selling Situations</Link><Link href="/insights">Insights</Link><Link href="/about">About</Link></div>
      <div><h2>Get started</h2><Link href="/#property-form">Discuss My Property</Link><Link href="/contact">Contact</Link><Link href="/faq">Frequently Asked Questions</Link></div>
      <div><h2>Legal</h2><Link href="/privacy-policy">Privacy Policy</Link><Link href="/terms">Terms</Link><p className="legal-note">Public launch, transaction claims, and legal disclosures are pending owner and California counsel approval.</p></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Sell My Kern Home.</span><span>A GNZ Marketing initiative.</span></div>
  </footer>;
}

