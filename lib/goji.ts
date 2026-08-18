export type Mood = "guarded" | "alert" | "playful" | "happy" | "calm"

export type PackStatus = {
  label: string
  badge: string
}

export type TrustTier = {
  key: "guarded" | "alert" | "calm"
  dot: string
  title: string
  sub: string
  color: string
}

export const GOJI_IMAGE: Record<"guarded" | "playful" | "calm", string> = {
  guarded: "/goji-guarded.png",
  playful: "/goji-playful.png",
  calm: "/goji-calm.png",
}

export function tierForTrust(trust: number): TrustTier {
  if (trust <= 30) {
    return {
      key: "guarded",
      dot: "🔴",
      title: "Goji is Guarded",
      sub: "Growling & Watching",
      color: "var(--growl)",
    }
  }
  if (trust <= 70) {
    return {
      key: "alert",
      dot: "🟠",
      title: "Goji is Alert",
      sub: "Sniffing the Air",
      color: "var(--alert)",
    }
  }
  return {
    key: "calm",
    dot: "🟢",
    title: "Goji is Calm",
    sub: "Ready to Lead the Way",
    color: "var(--calm)",
  }
}

export function imageForMood(mood: Mood): string {
  if (mood === "playful" || mood === "happy") return GOJI_IMAGE.playful
  if (mood === "calm") return GOJI_IMAGE.calm
  return GOJI_IMAGE.guarded
}

export function packStatusForMood(mood: Mood, trust: number): PackStatus {
  switch (mood) {
    case "playful":
      return { label: "PLAYFUL", badge: "🎾" }
    case "happy":
      return { label: "HAPPY", badge: "🦴" }
    case "calm":
      return trust >= 100
        ? { label: "TRUSTED COMPANION", badge: "🦴" }
        : { label: "CALM", badge: "🌲" }
    case "alert":
      return { label: "ALERT", badge: "👃" }
    default:
      return { label: "ON GUARD", badge: "🌲" }
  }
}

const GROWL_LINES = [
  "GRRR... Ears twitching. Who approaches the trail?",
  "*low growl* — She plants her paws and studies you. Not yet, stranger.",
  "Hackles raised. Goji circles once, keeping the treeline between you.",
  "A sharp bark echoes off the pines. She does not trust easy.",
]

const ALERT_LINES = [
  "Nose to the wind... Goji tilts her head, weighing your scent.",
  "Ears swivel toward your voice. She takes one cautious step closer.",
  "*sniff sniff* — Curiosity flickers. She's listening now.",
  "Tail held level. Goji watches your hands, deciding.",
]

const CALM_LINES = [
  "Tail sweeps low and easy. Goji leans into your reach.",
  "A soft huff of breath. She trots ahead, glancing back — follow.",
  "Goji sits, eyes bright and steady. The pack accepts you.",
  "She nudges your palm with her muzzle. Trust, earned on the trail.",
]

const NEGATIVE_WORDS = [
  "bad",
  "stupid",
  "dumb",
  "hate",
  "ugly",
  "shut up",
  "go away",
  "leave",
  "no",
  "stop",
  "worthless",
  "useless",
  "kill",
  "hurt",
  "hit",
  "scared",
  "afraid",
  "attack",
  "bite",
  "mean",
  "angry",
  "quiet",
  "boo",
  "get lost",
  "annoying",
  "idiot",
]

const NEGATIVE_REPLIES = [
  "*ears flatten* — Goji backs away, a low growl rumbling in her chest. That tone won't earn the trail.",
  "GRRR... She bristles and plants her paws. Harsh words push the pack away.",
  "Goji flinches, tail tucking low. She retreats a step, watching you warily.",
  "A warning snarl. She circles wider now, trust slipping back into the trees.",
]

// Returns true if the message reads as hostile/negative toward Goji.
export function isNegativeMessage(text: string): boolean {
  const t = text.toLowerCase()
  return NEGATIVE_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(t))
}

export function negativeReply(): string {
  return NEGATIVE_REPLIES[Math.floor(Math.random() * NEGATIVE_REPLIES.length)]
}

export function gojiReply(trust: number): string {
  const pool = trust <= 30 ? GROWL_LINES : trust <= 70 ? ALERT_LINES : CALM_LINES
  return pool[Math.floor(Math.random() * pool.length)]
}

export function ballReply(): string {
  return "🎾 Goji bolts after the ball, kicking up pine needles, and prances back tail wagging!"
}

export function treatReply(): string {
  return "🦴 She sniffs the jerky, takes it gently, and thumps her tail against the earth. Good sign."
}
