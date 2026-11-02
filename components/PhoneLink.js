import { Phone } from "lucide-react";
import { BUSINESS_PHONE_DISPLAY, BUSINESS_PHONE_HREF } from "@/lib/site";

export default function PhoneLink({ children, className = "", location, label = `Call ${BUSINESS_PHONE_DISPLAY}` }) {
  return <a className={className} href={BUSINESS_PHONE_HREF} aria-label={label} data-analytics-location={location}>
    <Phone aria-hidden="true" size={17} />
    {children || BUSINESS_PHONE_DISPLAY}
  </a>;
}
