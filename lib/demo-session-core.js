import { SignJWT, jwtVerify } from "jose";

export const DEMO_COOKIE_NAME = "smkh_demo_session";
export const DEMO_SESSION_SCOPE = "smkh-private-staging";
export const DEMO_SESSION_TTL_SECONDS = 4 * 60 * 60;

function encoded(secret) {
  return new TextEncoder().encode(secret);
}

export async function signDemoSession(secret, now = Date.now()) {
  const issuedAt = Math.floor(now / 1000);
  return new SignJWT({ scope: DEMO_SESSION_SCOPE })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("shared-preview-access")
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + DEMO_SESSION_TTL_SECONDS)
    .sign(encoded(secret));
}

export async function verifyDemoSession(token, secret, now = Date.now()) {
  if (!token || !secret) return false;
  try {
    const { payload } = await jwtVerify(token, encoded(secret), {
      algorithms: ["HS256"],
      currentDate: new Date(now),
      requiredClaims: ["sub", "iat", "exp"],
    });
    return payload.sub === "shared-preview-access" && payload.scope === DEMO_SESSION_SCOPE;
  } catch {
    return false;
  }
}
