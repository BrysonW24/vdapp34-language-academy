"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RotateCcw } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.18em] text-editorial-muted mb-3">
        Something went wrong
      </p>
      <h1 className="text-2xl sm:text-3xl font-serif text-editorial-ink mb-4">
        We hit an unexpected error.
      </h1>
      <p className="text-base text-editorial-muted mb-8 leading-relaxed">
        This is on us. Try the page again, and if it keeps happening, head back
        to the home surface.
      </p>
      {error?.digest && (
        <p className="text-xs text-editorial-muted mb-6 font-mono">
          digest: {error.digest}
        </p>
      )}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-1.5 text-sm text-editorial-ink hover:opacity-70 transition-opacity"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-editorial-muted hover:text-editorial-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to home
        </Link>
      </div>
    </div>
  )
}
