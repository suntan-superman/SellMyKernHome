import "server-only";
import { createClient } from "@supabase/supabase-js";
import WebSocket from "ws";

export function hasStorageConfig() { return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY); }
export function createServiceClient() {
  if (!hasStorageConfig()) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) },
    realtime: { transport: WebSocket },
  });
}

