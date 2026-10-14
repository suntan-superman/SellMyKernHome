import Breadcrumbs from "./Breadcrumbs";

export default function PageHero({ eyebrow = "SELL MY KERN HOME", title, intro, breadcrumbs = [] }) {
  return <section className="page-hero"><div className="content-shell"><Breadcrumbs items={breadcrumbs} /><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-intro">{intro}</p></div></section>;
}

