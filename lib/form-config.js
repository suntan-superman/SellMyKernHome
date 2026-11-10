import "server-only";
import { getPartnerDeliveryConfiguration } from "./partner-config";

export function getSellerFormConfiguration() {
  const partner = getPartnerDeliveryConfiguration();
  return {
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
    recipientAudience: "authorized Sell My Kern Home administrators",
    recipientTeam: "authorized Sell My Kern Home administrators",
    sharingAvailable: partner.sharingAvailable,
    approvedSharingRecipients: partner.approvedRecipients,
  };
}
