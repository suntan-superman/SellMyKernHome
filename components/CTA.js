import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA({ title = "Ready to talk through your property?", body = "Share a few details. We’ll review them and follow up to discuss what may make sense for your situation." }) {
  return <section className="cta-section"><div><p className="eyebrow">A SIMPLE FIRST STEP</p><h2>{title}</h2><p>{body}</p></div><Link className="button button-light" href="/#property-form" data-analytics-event="primary_cta_click" data-analytics-location="section_cta">Discuss My Property <ArrowRight size={18} /></Link></section>;
}

