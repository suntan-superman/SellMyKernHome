const expected = {
  projectRef: "jsrvdryddojhkmjzotef",
  supabaseUrl: "https://jsrvdryddojhkmjzotef.supabase.co",
  siteUrl: "https://sellmykernhome.com",
  ownerEmail: "sroy@worksidesoftware.com",
  ownerId: "6931a31e-9d5e-47e1-8878-139b5f9cd5c6",
  ownerDisplayName: "Workside Software",
};

const isNetlifyProduction = process.env.NETLIFY === "true" && process.env.CONTEXT === "production";

if (!isNetlifyProduction) {
  console.log("Production configuration verification skipped outside a Netlify production build.");
  process.exit(0);
}

function fail(message) {
  throw new Error(`Production configuration verification failed: ${message}`);
}

function requireValue(name) {
  const value = process.env[name]?.trim();
  if (!value) fail(`${name} is missing.`);
  return value;
}

const supabaseUrl = requireValue("NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = requireValue("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const secretKey = requireValue("SUPABASE_SECRET_KEY");
const siteUrl = requireValue("NEXT_PUBLIC_SITE_URL");
const adminBaseUrl = requireValue("SMKH_ADMIN_BASE_URL");
const notificationRecipient = requireValue("LEAD_NOTIFICATION_EMAIL");
const gaMeasurementId = requireValue("NEXT_PUBLIC_GA_MEASUREMENT_ID");

if (supabaseUrl !== expected.supabaseUrl) fail("the Supabase project URL is not PropertyIntelligence.");
if (!publishableKey.startsWith("sb_publishable_")) fail("the Supabase publishable key format is invalid.");
if (!secretKey.startsWith("sb_secret_")) fail("the server-only Supabase secret key format is invalid.");
if (siteUrl !== expected.siteUrl) fail("NEXT_PUBLIC_SITE_URL is not the production domain.");
if (adminBaseUrl !== expected.siteUrl) fail("SMKH_ADMIN_BASE_URL is not the production domain.");
if (process.env.SMKH_NOTIFICATIONS_ENABLED !== "false") fail("notifications must remain disabled.");
if (process.env.NEXT_PUBLIC_ROBOTS_INDEX !== "false") fail("search indexing must remain disabled.");
if (notificationRecipient.toLowerCase() !== expected.ownerEmail) fail("the notification recipient is not the Workside owner only.");
if (!/^G-[A-Z0-9]+$/.test(gaMeasurementId)) fail("NEXT_PUBLIC_GA_MEASUREMENT_ID is not a valid GA4 measurement ID.");

const activeGnzKeys = Object.entries(process.env)
  .filter(([key, value]) => key.includes("GNZ") && String(value ?? "").trim())
  .map(([key]) => key);
if (activeGnzKeys.length) fail(`obsolete GNZ configuration is active: ${activeGnzKeys.join(", ")}.`);

const authSettings = await fetch(`${supabaseUrl}/auth/v1/settings`, {
  headers: { apikey: publishableKey },
});
if (!authSettings.ok) fail("the PI publishable key was rejected by Supabase Auth.");

const usersResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=1000`, {
  headers: {
    apikey: secretKey,
    Authorization: `Bearer ${secretKey}`,
  },
});
if (!usersResponse.ok) fail("the PI server secret was rejected by Supabase Auth.");
const usersPayload = await usersResponse.json();
const owner = usersPayload.users?.find((user) => user.email?.toLowerCase() === expected.ownerEmail);
if (!owner || owner.id !== expected.ownerId) fail("the certified PI owner Auth UUID/email pair does not match.");

const membershipResponse = await fetch(
  `${supabaseUrl}/rest/v1/smkh_admin_memberships?select=user_id,display_name,role,active&user_id=eq.${expected.ownerId}`,
  { headers: { apikey: secretKey } },
);
if (!membershipResponse.ok) fail(`the SMKH membership API returned HTTP ${membershipResponse.status}.`);
const memberships = await membershipResponse.json();
const membership = memberships[0];
if (
  memberships.length !== 1 ||
  membership.user_id !== expected.ownerId ||
  membership.display_name !== expected.ownerDisplayName ||
  membership.role !== "owner" ||
  membership.active !== true
) {
  fail("the active Workside Software owner membership was not found.");
}

console.log(
  `Production configuration verified for ${expected.projectRef}, ${expected.ownerDisplayName}, notifications disabled, and indexing disabled.`,
);
