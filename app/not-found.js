import Link from "next/link";

export default function NotFound() {
  return <main id="main-content"><section className="page-hero"><div className="content-shell prose-narrow"><p className="eyebrow">PAGE NOT FOUND</p><h1>That address does not lead to a page.</h1><p className="page-intro">The page may have moved, or the link may be incomplete.</p><Link className="button" href="/">Return home</Link></div></section></main>;
}
