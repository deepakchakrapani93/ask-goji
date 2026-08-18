import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseUrl } from "@/lib/env"

export function createSupabaseAdmin(): SupabaseClient | null {
  const url = getSupabaseUrl()
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SB_SECRET_KEY ??
    ""

  if (!url || !key) return null

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
