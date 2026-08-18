import { createClient } from "@supabase/supabase-js"
import { getSupabaseKey, getSupabaseUrl } from "@/lib/env"

export function createSupabaseClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
    )
  }

  return createClient(url, key)
}
