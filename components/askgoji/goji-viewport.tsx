"use client"

import Image from "next/image"
import { Volume2, VolumeX } from "lucide-react"
import { type Mood, imageForMood, packStatusForMood } from "@/lib/goji"

export function GojiViewport({
  mood,
  trust,
  muted,
  onToggleMute,
}: {
  mood: Mood
  trust: number
  muted: boolean
  onToggleMute: () => void
}) {
  const src = imageForMood(mood)
  const status = packStatusForMood(mood, trust)

  return (
    <section aria-label="Goji field photograph" className="relative px-1">
      {/* Tape strips */}
      <div
        aria-hidden
        className="absolute left-6 -top-1 z-20 h-6 w-16 -rotate-6 rounded-[2px]"
        style={{ background: "rgba(217,119,6,0.28)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
      />
      <div
        aria-hidden
        className="absolute right-6 -top-1 z-20 h-6 w-16 rotate-6 rounded-[2px]"
        style={{ background: "rgba(217,119,6,0.28)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
      />

      {/* Photo frame */}
      <div
        className="relative rounded-[4px] p-2.5 pb-8 shadow-lg"
        style={{
          background: "#fbf8f1",
          border: "1px solid rgba(92,61,46,0.25)",
          boxShadow: "0 8px 20px rgba(34,26,12,0.22), inset 0 0 0 1px rgba(255,255,255,0.6)",
        }}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px]">
          <Image
            key={src}
            src={src || "/placeholder.svg"}
            alt={`Goji the German Shepherd looking ${mood}`}
            fill
            priority
            sizes="(max-width: 480px) 100vw, 420px"
            className="object-cover"
            style={{ animation: "slide-up 0.4s ease" }}
          />

          {/* Vignette */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 40px rgba(18,39,30,0.35)" }}
          />

          {/* Pack status badge */}
          <div className="absolute left-2 top-2 z-10">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-serif text-[11px] font-semibold uppercase tracking-wide text-[color:var(--parchment)]"
              style={{
                background: "rgba(18,39,30,0.82)",
                border: "1px solid var(--amber)",
                backdropFilter: "blur(2px)",
              }}
            >
              <span aria-hidden>{status.badge}</span>
              {status.label}
            </span>
          </div>

          {/* Audio toggle — carved wooden bell */}
          <button
            type="button"
            onClick={onToggleMute}
            aria-pressed={muted}
            aria-label={muted ? "Unmute Goji sounds" : "Mute Goji sounds"}
            className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
            style={{
              background: "linear-gradient(180deg, #6d4a37, #43291d)",
              border: "1px solid rgba(244,239,230,0.35)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            {muted ? (
              <VolumeX size={17} className="text-[color:var(--parchment)]" />
            ) : (
              <Volume2 size={17} className="text-[color:var(--amber-glow)]" />
            )}
          </button>
        </div>

        {/* Handwritten caption line */}
        <p
          className="absolute bottom-2 left-0 w-full text-center font-serif text-[12px] italic text-[color:var(--leather)]"
        >
          Field Log — subject: &ldquo;Goji&rdquo; · trust {trust}%
        </p>
      </div>
    </section>
  )
}
