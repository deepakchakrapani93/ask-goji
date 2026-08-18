import { Suspense } from "react"
import { AskGojiApp } from "@/components/askgoji/ask-goji-app"
import { getPublicAudioConfig } from "@/lib/env"

export const dynamic = "force-dynamic"

function LoadingFallback() {
  return (
    <main className="texture-paper flex h-dvh items-center justify-center">
      <p className="font-serif text-[color:var(--leather)]">Loading hunt…</p>
    </main>
  )
}

export default function Page() {
  const initialConfig = getPublicAudioConfig()

  return (
    <Suspense fallback={<LoadingFallback />}>
      <AskGojiApp initialConfig={initialConfig} />
    </Suspense>
  )
}
