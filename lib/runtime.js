const environments = new Set(["production", "staging", "local"]);

export function getRuntimeEnvironment() {
  const configured = process.env.SMKH_ENVIRONMENT?.trim().toLowerCase();
  if (configured && environments.has(configured)) return configured;
  return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" ? "local" : "production";
}

export function isStagingEnvironment() {
  return getRuntimeEnvironment() === "staging";
}

export function isDemoMode() {
  return isStagingEnvironment() && process.env.SMKH_DEMO_MODE === "true";
}

export function isAnalyticsEnabled() {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()) return false;
  if (isStagingEnvironment()) return process.env.SMKH_ENABLE_STAGING_ANALYTICS === "true";
  return true;
}

export function isEmailEnabled() {
  if (isStagingEnvironment()) return process.env.SMKH_ENABLE_STAGING_EMAIL === "true";
  return true;
}
