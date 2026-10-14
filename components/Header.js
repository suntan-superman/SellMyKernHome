"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  ["/", "Home"], ["/how-it-works", "How It Works"], ["/selling-situations", "Selling Situations"],
  ["/about", "About"], ["/faq", "FAQ"], ["/contact", "Contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="nav-shell">
      <Logo />
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav id="primary-navigation" className={open ? "nav-open" : ""} aria-label="Primary navigation">
        {links.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link className="button nav-cta" href="/#property-form" onClick={() => setOpen(false)}>Tell Us About Your Property</Link>
      </nav>
    </div>
  </header>;
}

