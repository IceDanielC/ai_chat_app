import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mhdgprfqcfwsosnowows.supabase.co";

export function createSupabaseClient() {
  let supabaseClient: SupabaseClient | null = null;
  // 单例模式
  if (!supabaseClient) {
    supabaseClient = createClient(
      SUPABASE_URL,
      process.env.SUPABASE_PRIVATE_KEY!
    );
  }
  return supabaseClient;
}
