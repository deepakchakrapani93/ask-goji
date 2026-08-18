import { NextResponse } from "next/server"
import { getPublicAudioConfig } from "@/lib/env"
import { fetchHunt } from "@/lib/hunts"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const config = getPublicAudioConfig()
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.",
      },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const reelId =
    searchParams.get("reel") ?? config.defaultReel ?? null

  if (!reelId) {
    return NextResponse.json(
      { error: "Missing ?reel= parameter in the URL." },
      { status: 400 },
    )
  }

  try {
    const hunt = await fetchHunt(reelId)

    if (!hunt) {
      return NextResponse.json(
        {
          error: `No hunt found for reel "${reelId}".`,
          hint:
            "Check that reel_id is exactly cafe_01 and that Row Level Security allows public SELECT on the Hunts table.",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({ hunt, reelId, config })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not connect to Supabase."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
