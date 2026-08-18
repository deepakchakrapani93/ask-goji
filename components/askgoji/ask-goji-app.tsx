"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Footprints } from "lucide-react"
import { TrustGauge } from "@/components/askgoji/trust-gauge"
import { GojiViewport } from "@/components/askgoji/goji-viewport"
import { ActionBar, type ActionKey } from "@/components/askgoji/action-bar"
import { WildernessLog, type LogEntry } from "@/components/askgoji/wilderness-log"
import { UnlockBanner } from "@/components/askgoji/unlock-banner"
import { playAudioUrl } from "@/lib/audio"
import type { PublicAudioConfig } from "@/lib/env"
import { imageKeyForMood, resolveHuntAudio, type Hunt } from "@/lib/hunts"
import { withCacheBust } from "@/lib/assets"
import {
  type Mood,
  ballReply,
  gojiReply,
  isNegativeMessage,
  negativeReply,
  tierForTrust,
  treatReply,
} from "@/lib/goji"

let entryId = 3

type HuntApiResponse = {
  hunt: Hunt
  reelId: string
  config: PublicAudioConfig
}

type HuntApiError = {
  error?: string
  hint?: string
}

export function AskGojiApp({
  initialConfig,
}: {
  initialConfig?: PublicAudioConfig | null
}) {
  const searchParams = useSearchParams()
  const reelFromUrl = searchParams.get("reel")

  const [audioConfig, setAudioConfig] = useState<PublicAudioConfig | null>(
    initialConfig ?? null,
  )
  const reelId =
    reelFromUrl ?? audioConfig?.defaultReel ?? initialConfig?.defaultReel ?? null

  const [hunt, setHunt] = useState<Hunt | null>(null)
  const [huntLoading, setHuntLoading] = useState(true)
  const [huntError, setHuntError] = useState<string | null>(null)
  const [huntHint, setHuntHint] = useState<string | null>(null)

  const [trust, setTrust] = useState(0)
  const [mood, setMood] = useState<Mood>("guarded")
  const [muted, setMuted] = useState(false)
  const [log, setLog] = useState<LogEntry[]>([
    {
      id: 1,
      from: "goji",
      text: "GRRR... Ears twitching. Who approaches the trail?",
    },
    {
      id: 2,
      from: "goji",
      text: "Earn my trust, stranger. Toss the ball, share your jerky, speak kind — then I'll lead you.",
    },
  ])

  const prevTierRef = useRef(tierForTrust(0).key)
  const skipTierAudioRef = useRef(false)
  const playedIntroGrowlRef = useRef(false)

  const unlocked = trust >= 100
  const googleMapsUrl = hunt?.google_maps_url ?? null

  useEffect(() => {
    let cancelled = false

    async function loadHunt() {
      setHuntLoading(true)
      setHuntError(null)
      setHuntHint(null)

      const reel =
        reelFromUrl ?? initialConfig?.defaultReel ?? audioConfig?.defaultReel

      try {
        const params = new URLSearchParams()
        if (reel) params.set("reel", reel)

        const response = await fetch(`/api/hunt?${params.toString()}`, {
          cache: "no-store",
        })
        const body = (await response.json()) as HuntApiResponse & HuntApiError

        if (cancelled) return

        if (!response.ok) {
          setHuntError(body.error ?? "Could not load hunt.")
          setHuntHint(body.hint ?? null)
          setHunt(null)
          return
        }

        setHunt(body.hunt)
        setAudioConfig(body.config)
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "Unknown network error"
          setHuntError(`Could not load hunt (${message}).`)
          setHuntHint(
            "Check the browser Network tab for /api/hunt. If it returns HTML instead of JSON, Vercel deployment protection may be blocking the API.",
          )
        }
      } finally {
        if (!cancelled) setHuntLoading(false)
      }
    }

    void loadHunt()

    return () => {
      cancelled = true
    }
  }, [audioConfig?.defaultReel, initialConfig?.defaultReel, reelFromUrl])

  useEffect(() => {
    playedIntroGrowlRef.current = false
  }, [reelId])

  const playForKey = useCallback(
    async (
      key:
        | "ball"
        | "treat"
        | "growl"
        | "happy_bark"
        | "trust_guarded"
        | "trust_alert"
        | "trust_calm",
    ) => {
      if (!reelId) return

      let url =
        hunt &&
        audioConfig &&
        resolveHuntAudio(
          hunt,
          reelId,
          key,
          audioConfig.supabaseUrl,
          audioConfig.audioBucket,
        )

      try {
        const response = await fetch(
          `/api/asset?reel=${encodeURIComponent(reelId)}&kind=audio&key=${encodeURIComponent(key)}`,
        )
        if (response.ok) {
          const body = (await response.json()) as { url: string }
          url = body.url
        }
      } catch {
        // fall back to constructed URL
      }

      if (url) playAudioUrl(url, muted)
    },
    [audioConfig, hunt, muted, reelId],
  )

  useEffect(() => {
    if (huntLoading || !hunt || !reelId || playedIntroGrowlRef.current) return
    playedIntroGrowlRef.current = true
    void playForKey("growl")
  }, [huntLoading, hunt, reelId, playForKey])

  useEffect(() => {
    const tier = tierForTrust(trust).key

    if (tier === prevTierRef.current) return

    prevTierRef.current = tier

    if (skipTierAudioRef.current) {
      skipTierAudioRef.current = false
      return
    }

    if (tier === "guarded") playForKey("trust_guarded")
    else if (tier === "alert") playForKey("trust_alert")
    else playForKey("trust_calm")
  }, [trust, playForKey])

  const pushGoji = useCallback((text: string) => {
    setLog((l) => [...l, { id: entryId++, from: "goji", text }])
  }, [])

  const handleAction = useCallback(
    (key: ActionKey) => {
      if (unlocked) return

      const next = Math.min(
        100,
        trust + (key === "ball" ? 30 : key === "treat" ? 40 : 15),
      )
      const nextTier = tierForTrust(next).key
      const currentTier = tierForTrust(trust).key

      if (nextTier !== currentTier) skipTierAudioRef.current = true

      setTrust(next)

      if (key === "ball") {
        setMood("playful")
        playForKey("ball")
        pushGoji(ballReply())
      } else if (key === "treat") {
        setMood("happy")
        playForKey("treat")
        pushGoji(treatReply())
      } else {
        setMood(next > 70 ? "calm" : next > 30 ? "alert" : "guarded")
        playForKey(next <= 30 ? "growl" : "happy_bark")
        pushGoji(gojiReply(next))
      }
    },
    [playForKey, pushGoji, trust, unlocked],
  )

  const handleSend = useCallback(
    (text: string) => {
      if (unlocked) return

      setLog((l) => [...l, { id: entryId++, from: "user", text }])

      if (isNegativeMessage(text)) {
        const next = Math.max(0, trust - 10)
        const nextTier = tierForTrust(next).key
        const currentTier = tierForTrust(trust).key

        if (nextTier !== currentTier) skipTierAudioRef.current = true

        setTrust(next)
        setMood(next > 70 ? "calm" : next > 30 ? "alert" : "guarded")
        playForKey("growl")
        pushGoji(negativeReply())
        return
      }

      const next = Math.min(100, trust + 15)
      const nextTier = tierForTrust(next).key
      const currentTier = tierForTrust(trust).key

      if (nextTier !== currentTier) skipTierAudioRef.current = true

      setTrust(next)
      setMood(next > 70 ? "calm" : next > 30 ? "alert" : "guarded")
      playForKey(next <= 30 ? "growl" : "happy_bark")
      pushGoji(gojiReply(next))
    },
    [playForKey, pushGoji, trust, unlocked],
  )

  const displayMood = useMemo<Mood>(() => {
    if (unlocked) return "calm"
    return mood
  }, [mood, unlocked])

  const [resolvedImageSrc, setResolvedImageSrc] = useState<string | undefined>()
  const [imageLoading, setImageLoading] = useState(true)

  useEffect(() => {
    if (!reelId) {
      setResolvedImageSrc(undefined)
      setImageLoading(false)
      return
    }

    let cancelled = false
    const moodKey = imageKeyForMood(displayMood)
    setImageLoading(true)
    setResolvedImageSrc(undefined)

    async function loadImage() {
      try {
        const response = await fetch(
          `/api/asset?reel=${encodeURIComponent(reelId!)}&kind=image&key=${encodeURIComponent(moodKey)}`,
          { cache: "no-store" },
        )
        if (cancelled) return
        if (response.ok) {
          const body = (await response.json()) as { url: string }
          setResolvedImageSrc(withCacheBust(body.url))
          return
        }
      } catch {
        // leave placeholder visible
      } finally {
        if (!cancelled) setImageLoading(false)
      }
    }

    void loadImage()

    return () => {
      cancelled = true
    }
  }, [displayMood, reelId])

  if (huntLoading) {
    return (
      <main className="texture-paper flex h-dvh items-center justify-center">
        <p className="font-serif text-[color:var(--leather)]">Loading hunt…</p>
      </main>
    )
  }

  if (huntError) {
    return (
      <main className="texture-paper flex h-dvh items-center justify-center px-6">
        <div className="max-w-sm text-center">
          <p className="font-serif text-[color:var(--growl)]">{huntError}</p>
          {huntHint && (
            <p className="mt-3 font-serif text-[14px] text-[color:var(--leather)]">
              {huntHint}
            </p>
          )}
          {!reelId && (
            <p className="mt-3 font-serif text-[14px] text-[color:var(--leather)]">
              Open the hunt with a reel in the URL, for example{" "}
              <a
                href="?reel=cafe_01"
                className="font-semibold text-[color:var(--pine)] underline"
              >
                ?reel=cafe_01
              </a>
              .
            </p>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="texture-paper flex h-dvh justify-center overflow-hidden">
      <div className="flex h-dvh min-h-0 w-full max-w-[480px] flex-col gap-3 px-3 pb-4 pt-4">
        <header className="shrink-0 text-center">
          <div
            className="mx-auto inline-flex items-center gap-2 rounded-lg px-5 py-2.5"
            style={{
              background: "linear-gradient(180deg, #234835, var(--pine))",
              border: "2px solid var(--amber)",
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -3px 8px rgba(0,0,0,0.45), 0 4px 8px rgba(0,0,0,0.25)",
            }}
          >
            <Footprints size={22} className="text-[color:var(--amber-glow)]" />
            <h1 className="font-serif text-2xl font-bold uppercase tracking-widest text-[color:var(--parchment)]">
              AskGoji <span aria-hidden>🐾</span>
            </h1>
          </div>
          <p className="mt-2 font-serif text-[13px] italic text-[color:var(--leather)]">
            Earn Goji&apos;s trust to unlock the coordinates.
          </p>
        </header>

        <TrustGauge trust={trust} />

        <GojiViewport
          mood={displayMood}
          trust={trust}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
          imageSrc={resolvedImageSrc}
          imageLoading={imageLoading}
        />

        <ActionBar onAction={handleAction} disabled={unlocked} />

        <WildernessLog entries={log} onSend={handleSend} locked={unlocked} />
      </div>

      <UnlockBanner open={unlocked} googleMapsUrl={googleMapsUrl} />
    </main>
  )
}
