"use client"

import { useEffect, useRef, useState } from "react"
import { Send } from "lucide-react"

export type LogEntry = {
  id: number
  from: "user" | "goji"
  text: string
}

export function WildernessLog({
  entries,
  onSend,
  locked,
}: {
  entries: LogEntry[]
  onSend: (text: string) => void
  locked: boolean
}) {
  const [value, setValue] = useState("")
  const [composing, setComposing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [entries])

  function submit() {
    const t = value.trim()
    if (!t) return
    onSend(t)
    setValue("")
  }

  return (
    <section aria-label="Wilderness log" className="flex min-h-0 flex-1 flex-col">
      {/* Notebook page */}
      <div
        className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg"
        style={{
          background:
            "repeating-linear-gradient(180deg, #f7f2e7, #f7f2e7 27px, rgba(92,61,46,0.14) 28px), #f7f2e7",
          border: "1px solid var(--border)",
          borderBottom: "none",
        }}
      >
        {/* Red margin line */}
        <div
          aria-hidden
          className="absolute left-7 top-0 h-full w-px"
          style={{ background: "rgba(185,28,28,0.35)" }}
        />

        <div
          ref={scrollRef}
          className="relative flex-1 space-y-2.5 overflow-y-auto px-3 py-3 pl-9"
        >
          {entries.map((e) =>
            e.from === "user" ? (
              <div key={e.id} className="flex justify-end">
                <p
                  className="max-w-[80%] rounded-lg rounded-br-sm px-3 py-2 text-[13px] leading-relaxed text-[color:var(--foreground)]"
                  style={{
                    background: "#fffdf7",
                    border: "1px solid var(--border)",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                  }}
                >
                  {e.text}
                </p>
              </div>
            ) : (
              <div key={e.id} className="flex justify-start">
                <p
                  className="max-w-[85%] font-serif text-[13px] italic leading-relaxed text-[color:var(--pine-deep)]"
                  style={{ textShadow: "0 1px 0 rgba(255,255,255,0.5)" }}
                >
                  <span aria-hidden className="mr-1">🐾</span>
                  {e.text}
                </p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Input bar */}
      <div className="panel-pine rounded-b-lg px-2.5 py-2.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            disabled={locked}
            onChange={(e) => setValue(e.target.value)}
            onCompositionStart={() => setComposing(true)}
            onCompositionEnd={() => setComposing(false)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !composing &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Whistle softly or offer a command..."
            aria-label="Message Goji"
            className="min-w-0 flex-1 rounded-md px-3 py-2 text-[13px] text-black outline-none placeholder:text-[color:var(--muted-foreground)]"
            style={{
              background: "#f7f2e7",
              border: "1px solid rgba(0,0,0,0.25)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
            }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={locked || !value.trim()}
            aria-label="Send message"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md transition-transform active:scale-95 disabled:opacity-50"
            style={{
              background: "linear-gradient(180deg, var(--amber-glow), var(--amber))",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            <Send size={18} className="text-[color:var(--pine-deep)]" />
          </button>
        </div>
      </div>
    </section>
  )
}
