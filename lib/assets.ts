import { getAudioBucket, getSupabaseUrl } from "@/lib/env"

type AssetKind = "audio" | "image"

const AUDIO_NAMES: Record<string, string[]> = {
  ball: ["play_bark.mp3"],
  treat: ["happy_bark.mp3"],
  growl: ["growl.mp3"],
  happy_bark: ["happy_bark.mp3"],
  play_bark: ["play_bark.mp3"],
  trust_guarded: ["growl.mp3"],
  trust_alert: ["happy_bark.mp3"],
  trust_calm: ["happy_bark.mp3"],
}

const IMAGE_NAMES: Record<string, string[]> = {
  guarded: ["goji_guarded.JPG", "goji_guarded.jpg", "guarded.jpg"],
  alert: ["goji_alert.JPG", "goji_alert.jpg", "alert.jpg"],
  playful: ["goji_happy.JPG", "goji_happy.jpg", "goji_playful.jpg", "playful.jpg"],
  calm: ["goji_happy.JPG", "goji_happy.jpg", "goji_calm.jpg", "calm.jpg"],
}

export function withCacheBust(url: string): string {
  const base = url.split("?")[0] ?? url
  return `${base}?v=${Date.now()}`
}

function assetFilename(kind: AssetKind, key: string): string {
  const names =
    kind === "audio"
      ? (AUDIO_NAMES[key] ?? [`${key}.mp3`])
      : (IMAGE_NAMES[key] ?? [`${key}.jpg`, `${key}.png`])
  return names[0]
}

export function canonicalAssetUrl(
  reelId: string,
  kind: AssetKind,
  key: string,
  bucket = getAudioBucket(),
  supabaseUrl = getSupabaseUrl(),
): string {
  return storagePublicUrl(
    bucket,
    `${reelId}/${assetFilename(kind, key)}`,
    supabaseUrl,
  )
}

async function urlExists(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" })
    if (head.ok) return true
  } catch {
    // try GET below
  }

  try {
    const get = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
    })
    return get.ok || get.status === 206
  } catch {
    return false
  }
}

function storagePublicUrl(
  bucket: string,
  objectPath: string,
  supabaseUrl = getSupabaseUrl(),
): string {
  const base = supabaseUrl.replace(/\/$/, "")
  const encoded = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/")
  return `${base}/storage/v1/object/public/${bucket}/${encoded}`
}

export function buildAssetCandidates(
  reelId: string,
  kind: AssetKind,
  key: string,
  bucket = getAudioBucket(),
  supabaseUrl = getSupabaseUrl(),
): string[] {
  const names =
    kind === "audio"
      ? (AUDIO_NAMES[key] ?? [`${key}.mp3`])
      : (IMAGE_NAMES[key] ?? [`${key}.jpg`, `${key}.png`])

  const folders = [
    reelId,
    "",
    `${reelId}/images`,
    `${reelId}/audio`,
    "images",
    "audio",
  ]

  const urls = new Set<string>()
  for (const folder of folders) {
    for (const name of names) {
      const path = folder ? `${folder}/${name}` : name
      urls.add(storagePublicUrl(bucket, path, supabaseUrl))
    }
  }

  return [...urls]
}

export async function resolveAssetUrl(
  reelId: string,
  kind: AssetKind,
  key: string,
  bucket?: string,
  supabaseUrl?: string,
  fallbackReelId?: string | null,
): Promise<string | null> {
  const resolvedBucket = bucket ?? getAudioBucket()
  const baseUrl = supabaseUrl ?? getSupabaseUrl()
  const primaryUrl = canonicalAssetUrl(
    reelId,
    kind,
    key,
    resolvedBucket,
    baseUrl,
  )

  if (await urlExists(primaryUrl)) return primaryUrl

  if (fallbackReelId && fallbackReelId !== reelId) {
    return canonicalAssetUrl(
      fallbackReelId,
      kind,
      key,
      resolvedBucket,
      baseUrl,
    )
  }

  // Public bucket: still return the canonical URL if HEAD failed on the server.
  return primaryUrl
}
