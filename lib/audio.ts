import { Howl, Howler } from "howler"

let activeHowl: Howl | null = null
let pendingUrl: string | null = null
let pendingMuted = false
let unlockListenersAttached = false

function attachUnlockListeners() {
  if (unlockListenersAttached || typeof window === "undefined") return
  unlockListenersAttached = true

  const unlock = () => {
    void Howler.ctx?.resume()
    if (pendingUrl && !pendingMuted) {
      const url = pendingUrl
      pendingUrl = null
      playAudioUrl(url, false)
    }
  }

  for (const event of ["pointerdown", "keydown", "touchstart"] as const) {
    window.addEventListener(event, unlock, { once: true, passive: true })
  }
}

export function playAudioUrl(url: string, muted: boolean) {
  if (muted || !url || typeof window === "undefined") return

  attachUnlockListeners()

  activeHowl?.stop()
  activeHowl?.unload()

  activeHowl = new Howl({
    src: [url],
    volume: 0.6,
    html5: true,
    onplayerror: () => {
      pendingUrl = url
      pendingMuted = muted
      Howler.once("unlock", () => {
        if (pendingUrl && !pendingMuted) {
          const retryUrl = pendingUrl
          pendingUrl = null
          playAudioUrl(retryUrl, false)
        }
      })
    },
  })

  const soundId = activeHowl.play()
  if (soundId === undefined) {
    pendingUrl = url
    pendingMuted = muted
  }
}
