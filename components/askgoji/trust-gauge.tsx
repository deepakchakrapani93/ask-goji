"use client"

import { PawPrint } from "lucide-react"
import { tierForTrust } from "@/lib/goji"

export function TrustGauge({ trust }: { trust: number }) {
  const tier = tierForTrust(trust)
  const paws = [25, 50, 75, 100]

  return (
    <section
      aria-label="Goji trust meter"
      className="panel-leather stitch rounded-lg px-3 py-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span aria-hidden className="text-sm leading-none">
            {tier.dot}
          </span>
          <div className="min-w-0">
            <p className="font-serif text-[13px] font-semibold uppercase tracking-wide text-[color:var(--parchment)] truncate">
              {tier.title}
            </p>
            <p className="text-[11px] leading-tight text-[color:var(--parchment)]/70 truncate">
              {tier.sub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {paws.map((threshold) => {
            const lit = trust >= threshold
            return (
              <PawPrint
                key={threshold}
                size={20}
                aria-hidden
                className="transition-all duration-300"
                style={{
                  color: lit ? "var(--amber-glow)" : "rgba(244,239,230,0.25)",
                  filter: lit ? "drop-shadow(0 0 4px var(--amber))" : "none",
                  transform: lit ? "scale(1.05)" : "scale(0.9)",
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Wooden meter track */}
      <div
        className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={trust}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Trust level ${trust} percent`}
        style={{
          background: "rgba(0,0,0,0.35)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.5)",
        }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{
            width: `${trust}%`,
            background: `linear-gradient(90deg, ${tier.color}, var(--amber-glow))`,
          }}
        />
      </div>
    </section>
  )
}
