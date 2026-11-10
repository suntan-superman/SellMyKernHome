import "server-only";

export function getSellerFormConfiguration() {
  return {
    turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
    recipientAudience: "authorized Sell My Kern Home administrators",
    recipientTeam: "authorized Sell My Kern Home administrators",
  };
}
