import { getAudioBucket, getSupabaseUrl } from "@/lib/env"
import { createSupabaseClient } from "@/lib/supabase"

export type Hunt = {
  google_maps_url: string
  location_name?: string | null
  audio_ball_url?: string | null
  audio_treat_url?: string | null
  audio_growl_url?: string | null
  audio_happy_bark_url?: string | null
  audio_trust_guarded_url?: string | null
  audio_trust_alert_url?: string | null
  audio_trust_calm_url?: string | null
  image_guarded_url?: string | null
  image_playful_url?: string | null
  image_calm_url?: string | null
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
    throw new Error(error.message)
  }

  if (!data?.google_maps_url) return null

  return data as Hunt
}

export function publicStorageUrl(
  reelId: string,
  filename: string,
  supabaseUrl = getSupabaseUrl(),
  bucket = getAudioBucket(),
): string {
  const base = supabaseUrl.replace(/\/$/, "")
  return `${base}/storage/v1/object/public/${bucket}/${reelId}/${filename}`
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
  ball: "play_bark.mp3",
  treat: "happy_bark.mp3",
  growl: "growl.mp3",
  happy_bark: "happy_bark.mp3",
  trust_guarded: "growl.mp3",
  trust_alert: "happy_bark.mp3",
  trust_calm: "happy_bark.mp3",
}

export function resolveHuntAudio(
  hunt: Hunt | null,
  reelId: string,
  key: AudioKey,
  supabaseUrl: string,
  audioBucket: string,
): string {
  const column = AUDIO_COLUMN[key]
  const fromDb = hunt?.[column]
  if (typeof fromDb === "string" && fromDb.length > 0) return fromDb

  return publicStorageUrl(reelId, AUDIO_FILE[key], supabaseUrl, audioBucket)
}

type ImageMoodKey = "guarded" | "alert" | "playful" | "calm"

const IMAGE_COLUMN: Record<ImageMoodKey, keyof Hunt> = {
  guarded: "image_guarded_url",
  alert: "image_guarded_url",
  playful: "image_playful_url",
  calm: "image_calm_url",
}

const IMAGE_FILE: Record<ImageMoodKey, string> = {
  guarded: "goji_guarded.jpg",
  alert: "goji_alert.jpg",
  playful: "goji_happy.jpg",
  calm: "goji_happy.jpg",
}

export function imageKeyForMood(mood: string): ImageMoodKey {
  if (mood === "alert") return "alert"
  if (mood === "playful" || mood === "happy") return "playful"
  if (mood === "calm") return "calm"
  return "guarded"
}

export function resolveHuntImage(
  hunt: Hunt | null,
  mood: string,
  reelId: string,
  supabaseUrl: string,
  assetsBucket: string,
): string {
  const key = imageKeyForMood(mood)
  const column = IMAGE_COLUMN[key]
  const fromDb = hunt?.[column]
  if (typeof fromDb === "string" && fromDb.length > 0) return fromDb

  return publicStorageUrl(reelId, IMAGE_FILE[key], supabaseUrl, assetsBucket)
}
