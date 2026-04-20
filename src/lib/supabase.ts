import { createClient } from "@supabase/supabase-js";

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Browser / component client (singleton)
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

// Server-side admin client (uses service-role key — only on server)
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type SupabaseDatabase = {
  readings: {
    id: string;
    email: string | null;
    reading_data: object;
    palm_type: string;
    share_token: string;
    created_at: string;
  };
  user_credits: {
    email: string;
    credits: number;
    plan: "free" | "credits" | "monthly";
    plan_expires_at: string | null;
    updated_at: string;
  };
};
