import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-2xl">
      <p className="text-xs uppercase tracking-[0.18em] text-editorial-muted mb-3">
        404
      </p>
      <h1 className="text-2xl sm:text-3xl font-serif text-editorial-ink mb-4">
        We couldn&rsquo;t find that page.
      </h1>
      <p className="text-base text-editorial-muted mb-8 leading-relaxed">
        The page may have moved, or the curriculum surface you&rsquo;re looking
        for isn&rsquo;t available in this language yet.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-editorial-ink hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>
    </div>
  )
}
