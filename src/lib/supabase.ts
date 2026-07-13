// ===========================================
// NEWSYNC - Supabase Client
// ===========================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Only create client if URL is valid
let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseUrl.startsWith("http")) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Safe wrapper that returns a mock client when Supabase is not configured
export function getSupabase(): SupabaseClient | null {
  return supabase;
}

// Service role client (server-side only, for admin operations)
export function getServiceClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!supabaseUrl || !supabaseUrl.startsWith("http") || !serviceKey) {
    return null;
  }
  return createClient(supabaseUrl, serviceKey);
}

export { supabase };
