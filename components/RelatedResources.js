import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function RelatedResources({ links, title = "Related property resources" }) {
  return <section className="prose-section"><div className="prose-narrow"><h2>{title}</h2><ul className="related-links">{links.map(([href, label]) => <li key={href}><Link href={href}>{label} <ArrowRight size={16} /></Link></li>)}</ul></div></section>;
}
