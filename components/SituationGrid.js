import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { createElement } from "react";
import { situations } from "@/content/situations";

export default function SituationGrid() {
  return <div className="situation-grid">{situations.map(({ slug, href, title, short, icon }) => <Link className="situation-card" href={href} key={slug}><span className="icon-tile">{createElement(icon)}</span><h3>{title}</h3><p>{short}</p><span className="text-link">Explore this situation <ArrowUpRight size={17} /></span></Link>)}</div>;
}

