import { getAudioBucket, getSupabaseUrl } from "@/lib/env"
import { createSupabaseAdmin } from "@/lib/supabase-admin"

type AssetKind = "audio" | "image"

const AUDIO_NAMES: Record<string, string[]> = {
  ball: ["goji_happy.mp3", "goji_bark.mp3", "happy_bark.mp3", "happy-bark.mp3", "bark.mp3"],
  treat: ["goji_happy.mp3", "goji_treat.mp3", "happy_bark.mp3", "treat.mp3", "bark.mp3"],
  growl: ["goji_growl.mp3", "growl.mp3", "Growl.mp3"],
  happy_bark: ["goji_happy.mp3", "goji_happy_bark.mp3", "happy_bark.mp3", "bark.mp3"],
  trust_guarded: ["goji_growl.mp3", "growl.mp3"],
  trust_alert: ["goji_alert.mp3", "alert.mp3", "growl.mp3", "goji_growl.mp3"],
  trust_calm: ["goji_happy.mp3", "goji_happy_bark.mp3", "happy_bark.mp3"],
}

const IMAGE_NAMES: Record<string, string[]> = {
  guarded: ["goji_guarded.jpg", "goji-guarded.jpg", "guarded.jpg"],
  alert: ["goji_alert.jpg", "goji-alert.jpg", "alert.jpg"],
  playful: ["goji_happy.jpg", "goji_playful.jpg", "goji-playful.jpg", "playful.jpg"],
  calm: ["goji_happy.jpg", "goji_calm.jpg", "goji-calm.jpg", "calm.jpg"],
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

export async function resolveFirstAvailableUrl(
  candidates: string[],
): Promise<string | null> {
  for (const url of candidates) {
    try {
      const response = await fetch(url, { method: "HEAD", cache: "no-store" })
      if (response.ok) return url
    } catch {
      // try next candidate
    }
  }

  return null
}

export async function resolveAssetUrl(
  reelId: string,
  kind: AssetKind,
  key: string,
  bucket?: string,
  supabaseUrl?: string,
): Promise<string | null> {
  const resolvedBucket = bucket ?? getAudioBucket()
  const names =
    kind === "audio"
      ? (AUDIO_NAMES[key] ?? [`${key}.mp3`])
      : (IMAGE_NAMES[key] ?? [`${key}.jpg`, `${key}.png`])

  const admin = createSupabaseAdmin()
  if (admin) {
    const adminUrl = await resolveWithAdmin(admin, resolvedBucket, reelId, names)
    if (adminUrl) return adminUrl
  }

  const candidates = buildAssetCandidates(
    reelId,
    kind,
    key,
    resolvedBucket,
    supabaseUrl,
  )
  return resolveFirstAvailableUrl(candidates)
}

async function listAllFiles(
  admin: ReturnType<typeof createSupabaseAdmin>,
  bucket: string,
  prefix: string,
): Promise<string[]> {
  if (!admin) return []

  const paths: string[] = []
  const queue = [prefix]

  while (queue.length > 0) {
    const folder = queue.shift() ?? ""
    const { data, error } = await admin.storage.from(bucket).list(folder, {
      limit: 100,
    })

    if (error || !data) continue

    for (const item of data) {
      const path = folder ? `${folder}/${item.name}` : item.name
      if (item.id) {
        queue.push(path)
      } else {
        paths.push(path)
      }
    }
  }

  return paths
}

function matchesName(filePath: string, names: string[]): boolean {
  const base = filePath.split("/").pop()?.toLowerCase() ?? ""
  return names.some((name) => base === name.toLowerCase())
}

async function resolveWithAdmin(
  admin: NonNullable<ReturnType<typeof createSupabaseAdmin>>,
  bucket: string,
  reelId: string,
  names: string[],
): Promise<string | null> {
  const prefixes = [reelId, "", "images", "audio", `${reelId}/images`, `${reelId}/audio`]
  const seen = new Set<string>()

  for (const prefix of prefixes) {
    const files = await listAllFiles(admin, bucket, prefix)
    for (const filePath of files) {
      if (seen.has(filePath) || !matchesName(filePath, names)) continue
      seen.add(filePath)

      const { data: publicData } = admin.storage.from(bucket).getPublicUrl(filePath)
      if (publicData.publicUrl) {
        const publicOk = await resolveFirstAvailableUrl([publicData.publicUrl])
        if (publicOk) return publicOk
      }

      const { data: signed, error } = await admin.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60)

      if (!error && signed?.signedUrl) return signed.signedUrl
    }
  }

  return null
}
