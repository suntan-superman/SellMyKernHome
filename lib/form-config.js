import "server-only";

export function getSellerFormConfiguration() {
  return {
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
    recipientName: "Sell My Kern Home",
    recipientAudience: "authorized Sell My Kern Home administrators",
    recipientTeam: "Sell My Kern Home team",
  };
}
