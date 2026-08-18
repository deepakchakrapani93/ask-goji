import { Suspense } from "react"
import { AskGojiApp } from "@/components/askgoji/ask-goji-app"

function LoadingFallback() {
  return (
    <main className="texture-paper flex h-dvh items-center justify-center">
      <p className="font-serif text-[color:var(--leather)]">Loading hunt…</p>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AskGojiApp />
    </Suspense>
  )
}
