"use client"

import { Compass, MapPin } from "lucide-react"

const FALLBACK_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=45.2854,-121.7300"

export function UnlockBanner({
  open,
  googleMapsUrl,
}: {
  open: boolean
  googleMapsUrl?: string | null
}) {
  if (!open) return null

  const mapsUrl = googleMapsUrl ?? FALLBACK_MAPS_URL

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] animate-slide-up px-3 pb-4"
      role="dialog"
      aria-label="Trail coordinates revealed"
    >
      <div
        className="panel-leather relative overflow-hidden rounded-2xl p-4 pt-5"
        style={{ border: "1px solid var(--amber)" }}
      >
        {/* torn parchment header strip */}
        <div
          className="torn-bottom absolute inset-x-0 top-0 h-9"
          style={{ background: "var(--parchment)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ background: "var(--amber)" }}
            >
              <Compass size={18} className="text-[color:var(--pine-deep)]" />
            </span>
            <div>
              <p className="font-serif text-[15px] font-bold uppercase tracking-wide text-[color:var(--parchment)]">
                Coordinates Revealed
              </p>
              <p className="text-[12px] text-[color:var(--parchment)]/75">
                Goji trusts your pack! 📍
              </p>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-serif text-[15px] font-bold uppercase tracking-wide text-[color:var(--pine-deep)] transition-transform active:scale-[0.98]"
            style={{
              background: "linear-gradient(180deg, var(--amber-glow), var(--amber))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 10px rgba(0,0,0,0.35)",
            }}
          >
            <span className="relative grid h-6 w-6 place-items-center">
              <span className="absolute h-2.5 w-2.5 animate-waypoint rounded-full bg-[color:var(--growl)]" />
              <MapPin size={20} className="relative text-[color:var(--pine-deep)]" />
            </span>
            Open Trail Location in Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}
