"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import PhoneLink from "./PhoneLink";
import { BUSINESS_PHONE_DISPLAY } from "@/lib/site";

const links = [
  ["/", "Home"], ["/how-it-works", "How It Works"], ["/selling-situations", "Selling Situations"],
  ["/about", "About"], ["/faq", "FAQ"], ["/contact", "Contact"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <div className="nav-shell">
      <Logo />
      <div className="header-actions">
        <PhoneLink className="header-phone" location="header" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}><span><small>Call 24/7</small><strong>{BUSINESS_PHONE_DISPLAY}</strong></span></PhoneLink>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav id="primary-navigation" className={open ? "nav-open" : ""} aria-label="Primary navigation">
          {links.map(([href, label]) => <Link href={href} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link className="button nav-cta" href="/#property-form" data-analytics-event="primary_cta_click" data-analytics-location="header" onClick={() => setOpen(false)}>Tell Us About Your Property</Link>
        </nav>
      </div>
    </div>
  </header>;
}

