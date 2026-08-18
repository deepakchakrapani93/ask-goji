import { NextResponse } from "next/server"
import { buildAssetCandidates, resolveAssetUrl } from "@/lib/assets"
import { FALLBACK_ASSET_REEL, getPublicAudioConfig } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const config = getPublicAudioConfig()
  if (!config) {
    return NextResponse.json({ error: "Missing Supabase env vars." }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const reelId = searchParams.get("reel") ?? config.defaultReel
  const kind = searchParams.get("kind")
  const key = searchParams.get("key")

  if (!reelId || !kind || !key) {
    return NextResponse.json(
      { error: "Required query params: reel, kind, key" },
      { status: 400 },
    )
  }

  if (kind !== "audio" && kind !== "image") {
    return NextResponse.json({ error: "kind must be audio or image" }, { status: 400 })
  }

  const candidates = buildAssetCandidates(
    reelId,
    kind,
    key,
    config.audioBucket,
    config.supabaseUrl,
  )
  const resolved = await resolveAssetUrl(
    reelId,
    kind,
    key,
    config.audioBucket,
    config.supabaseUrl,
    FALLBACK_ASSET_REEL,
  )

  if (!resolved) {
    return NextResponse.json(
      {
        error: `No ${kind} asset found for key "${key}".`,
        tried: candidates.slice(0, 8),
        hint:
          `Upload files to goji-assets/${reelId}/ (e.g. growl.mp3, goji_guarded.JPG) or use assets from goji-assets/${FALLBACK_ASSET_REEL}/.`,
      },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    )
  }

  const url = resolved

  return NextResponse.json(
    { url, reelId, kind, key },
    { headers: { "Cache-Control": "no-store" } },
  )
}
