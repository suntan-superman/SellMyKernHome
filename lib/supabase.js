import "server-only";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

export function getStorageConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "",
    secretKey: process.env.SUPABASE_SECRET_KEY?.trim() || "",
  };
}

export function hasStorageConfig() {
  const config = getStorageConfig();
  return Boolean(config.url && config.secretKey);
}
export function createServiceClient() {
  const config = getStorageConfig();
  if (!config.url || !config.secretKey) return null;
  return createClient(config.url, config.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
    realtime: { transport: WebSocket },
  });
}

export function createPublicAuthClient() {
  const config = getStorageConfig();
  if (!config.url || !config.publishableKey) return null;
  return createClient(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
}

export function createAuthenticatedClient(accessToken) {
  const config = getStorageConfig();
  if (!config.url || !config.publishableKey || !accessToken) return null;
  return createClient(config.url, config.publishableKey, {
    accessToken: async () => accessToken,
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
  });
}

