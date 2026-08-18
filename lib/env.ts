export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    ""
  )
}

export function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    ""
  )
}

export function getAudioBucket(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_AUDIO_BUCKET ??
    process.env.SUPABASE_AUDIO_BUCKET ??
    "audio"
  )
}

export function getDefaultReel(): string | null {
  const reel =
    process.env.NEXT_PUBLIC_DEFAULT_REEL ?? process.env.DEFAULT_REEL ?? null
  return reel && reel.length > 0 ? reel : null
}

/** Reel folder used when a hunt has no images/audio of its own. */
export const FALLBACK_ASSET_REEL = "cafe_01"

export type PublicAudioConfig = {
  supabaseUrl: string
  audioBucket: string
  defaultReel: string | null
}

export function getPublicAudioConfig(): PublicAudioConfig | null {
  const supabaseUrl = getSupabaseUrl()
  const supabaseKey = getSupabaseKey()
  if (!supabaseUrl || !supabaseKey) return null

  return {
    supabaseUrl,
    audioBucket: getAudioBucket(),
    defaultReel: getDefaultReel(),
  }
}
