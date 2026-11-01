import "server-only";
import { isStagingEnvironment } from "./runtime";

export function getSellerFormConfiguration() {
  const staging = isStagingEnvironment();
  return {
    turnstileSiteKey: staging
      ? process.env.NEXT_PUBLIC_STAGING_TURNSTILE_SITE_KEY?.trim() || ""
      : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
    recipientName: staging ? "Sell My Kern Home demonstration team" : "GNZ Marketing",
    recipientAudience: staging ? "authorized Sell My Kern Home demonstration reviewers" : "authorized GNZ administrators",
    recipientTeam: staging ? "Sell My Kern Home demonstration team" : "GNZ team",
  };
}
