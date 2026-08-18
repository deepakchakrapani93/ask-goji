import { NextResponse } from "next/server"
import { getPublicAudioConfig } from "@/lib/env"

export const dynamic = "force-dynamic"

export async function GET() {
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

  return NextResponse.json(config)
}
