import "server-only";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";
import { isStagingEnvironment } from "./runtime";

export function getStorageConfig() {
  if (isStagingEnvironment()) {
    const url = process.env.STAGING_SUPABASE_URL?.trim() || "";
    const secretKey = process.env.STAGING_SUPABASE_SECRET_KEY?.trim() || "";
    if (url && process.env.NEXT_PUBLIC_SUPABASE_URL && url === process.env.NEXT_PUBLIC_SUPABASE_URL.trim()) {
      throw new Error("Staging storage is not configured with an isolated Supabase project.");
    }
    return { url, secretKey, environment: "staging" };
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "",
    secretKey: process.env.SUPABASE_SECRET_KEY?.trim() || "",
    environment: "production-or-local",
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

