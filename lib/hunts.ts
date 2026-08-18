import { createSupabaseClient } from "@/lib/supabase"

export type Hunt = {
  google_maps_url: string
  audio_ball_url?: string | null
  audio_treat_url?: string | null
  audio_growl_url?: string | null
  audio_happy_bark_url?: string | null
  audio_trust_guarded_url?: string | null
  audio_trust_alert_url?: string | null
  audio_trust_calm_url?: string | null
}

export async function fetchHunt(reelId: string): Promise<Hunt | null> {
  const supabase = createSupabaseClient()

  const { data, error } = await supabase
    .from("Hunts")
    .select("*")
    .eq("reel_id", reelId)
    .maybeSingle()

  if (error) {
    console.error("Failed to fetch hunt:", error.message)
    return null
  }

  if (!data?.google_maps_url) return null

  return data as Hunt
}

export function storageAudioUrl(reelId: string, filename: string): string {
  const supabase = createSupabaseClient()
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_AUDIO_BUCKET ?? "audio"

  return supabase.storage.from(bucket).getPublicUrl(`${reelId}/${filename}`)
    .data.publicUrl
}

type AudioKey =
  | "ball"
  | "treat"
  | "growl"
  | "happy_bark"
  | "trust_guarded"
  | "trust_alert"
  | "trust_calm"

const AUDIO_COLUMN: Record<AudioKey, keyof Hunt> = {
  ball: "audio_ball_url",
  treat: "audio_treat_url",
  growl: "audio_growl_url",
  happy_bark: "audio_happy_bark_url",
  trust_guarded: "audio_trust_guarded_url",
  trust_alert: "audio_trust_alert_url",
  trust_calm: "audio_trust_calm_url",
}

const AUDIO_FILE: Record<AudioKey, string> = {
  ball: "happy_bark.mp3",
  treat: "happy_bark.mp3",
  growl: "growl.mp3",
  happy_bark: "happy_bark.mp3",
  trust_guarded: "growl.mp3",
  trust_alert: "alert.mp3",
  trust_calm: "happy_bark.mp3",
}

export function resolveHuntAudio(
  hunt: Hunt | null,
  reelId: string,
  key: AudioKey,
): string {
  const column = AUDIO_COLUMN[key]
  const fromDb = hunt?.[column]
  if (typeof fromDb === "string" && fromDb.length > 0) return fromDb

  return storageAudioUrl(reelId, AUDIO_FILE[key])
}
