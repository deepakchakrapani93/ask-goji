import { Howl } from "howler"

let activeHowl: Howl | null = null

export function playAudioUrl(url: string, muted: boolean) {
  if (muted || !url || typeof window === "undefined") return

  activeHowl?.stop()
  activeHowl?.unload()

  activeHowl = new Howl({
    src: [url],
    volume: 0.6,
    html5: true,
  })

  activeHowl.play()
}
