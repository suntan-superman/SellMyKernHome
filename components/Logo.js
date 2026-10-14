import Link from "next/link";

export default function Logo({ light = false }) {
  return (
    <Link className={`logo ${light ? "logo-light" : ""}`} href="/" aria-label="Sell My Kern Home, home">
      <svg aria-hidden="true" viewBox="0 0 48 48"><path d="M7 24.5 24 9l17 15.5v16H29V29H19v11H7Z" /><path d="M14 22.5v-8.1c0-2.7 3.7-4.2 5.8-2.3L24 16" /></svg>
      <span><b>Sell My</b><strong>Kern Home</strong></span>
    </Link>
  );
}

