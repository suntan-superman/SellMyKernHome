"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";
import PhoneLink from "./PhoneLink";
import { BUSINESS_PHONE_DISPLAY } from "@/lib/site";

const links = [
  ["/", "Home"], ["/how-it-works", "How It Works"], ["/selling-situations", "Selling Situations"],
  ["/about", "About"], ["/faq", "FAQ"], ["/contact", "Contact"],
];

const insightLinks = [
  ["/insights", "Overview"],
  ["/insights#articles", "Articles"],
  ["/tools/home-carrying-cost-calculator", "Carrying Costs Calculator"],
  ["/tools/home-sale-net-proceeds-calculator", "Net Proceeds Calculator"],
  ["/tools/which-selling-option-fits-me", "Best Selling Options Quiz"],
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const insightsButtonRef = useRef(null);

  useEffect(() => {
    if (!insightsOpen) return;
    function closeOnOutsidePointer(event) {
      if (!dropdownRef.current?.contains(event.target)) setInsightsOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key !== "Escape") return;
      setInsightsOpen(false);
      insightsButtonRef.current?.focus();
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [insightsOpen]);

  function closeNavigation() {
    setOpen(false);
    setInsightsOpen(false);
  }

  return <header className="site-header">
    <div className="nav-shell">
      <Logo />
      <div className="header-actions">
        <PhoneLink className="header-phone" location="header" label={`Call Sell My Kern Home at ${BUSINESS_PHONE_DISPLAY}`}><span><small>Call 24/7</small><strong>{BUSINESS_PHONE_DISPLAY}</strong></span></PhoneLink>
        <button className="menu-button" type="button" aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => { setOpen(!open); setInsightsOpen(false); }}>{open ? <X /> : <Menu />}</button>
        <nav id="primary-navigation" className={open ? "nav-open" : ""} aria-label="Primary navigation">
          {links.slice(0, 3).map(([href, label]) => <Link href={href} key={href} onClick={closeNavigation}>{label}</Link>)}
          <div className="nav-dropdown" ref={dropdownRef}>
            <button ref={insightsButtonRef} id="insights-navigation-button" className="nav-dropdown-toggle" type="button" aria-expanded={insightsOpen} aria-controls="insights-navigation-menu" onClick={() => setInsightsOpen((current) => !current)}>Insights <ChevronDown size={15} aria-hidden="true" /></button>
            <div id="insights-navigation-menu" className="nav-submenu" aria-labelledby="insights-navigation-button" hidden={!insightsOpen}>
              {insightLinks.slice(0, 2).map(([href, label]) => <Link href={href} key={href} onClick={closeNavigation}>{label}</Link>)}
              <span className="nav-submenu-label">Tools</span>
              {insightLinks.slice(2).map(([href, label]) => <Link href={href} key={href} onClick={closeNavigation}>{label}</Link>)}
            </div>
          </div>
          {links.slice(3).map(([href, label]) => <Link href={href} key={href} onClick={closeNavigation}>{label}</Link>)}
          <Link className="button nav-cta" href="/#property-form" data-analytics-event="primary_cta_click" data-analytics-location="header" onClick={closeNavigation}>Tell Us About Your Property</Link>
        </nav>
      </div>
    </div>
  </header>;
}

