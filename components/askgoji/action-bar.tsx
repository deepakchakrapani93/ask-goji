"use client"

export type ActionKey = "ball" | "treat" | "speak"

const ACTIONS: { key: ActionKey; emoji: string; label: string; hint: string }[] = [
  { key: "ball", emoji: "🎾", label: "Throw Ball", hint: "+30 trust" },
  { key: "treat", emoji: "🦴", label: "Offer Jerky", hint: "+40 trust" },
  { key: "speak", emoji: "🐾", label: '"Good Girl"', hint: "+15 trust" },
]

export function ActionBar({
  onAction,
  disabled,
}: {
  onAction: (key: ActionKey) => void
  disabled: boolean
}) {
  return (
    <section aria-label="Companion actions" className="grid grid-cols-3 gap-2">
      {ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          disabled={disabled}
          onClick={(e) => {
            const el = e.currentTarget
            el.classList.remove("animate-stamp")
            void el.offsetWidth
            el.classList.add("animate-stamp")
            onAction(a.key)
          }}
          className="panel-leather stitch group flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-center transition-transform disabled:cursor-not-allowed disabled:opacity-55"
        >
          <span aria-hidden className="text-2xl leading-none">
            {a.emoji}
          </span>
          <span className="font-serif text-[11px] font-semibold uppercase tracking-wide text-[color:var(--parchment)]">
            {a.label}
          </span>
          <span className="text-[10px] text-[color:var(--amber-glow)]">{a.hint}</span>
        </button>
      ))}
    </section>
  )
}
