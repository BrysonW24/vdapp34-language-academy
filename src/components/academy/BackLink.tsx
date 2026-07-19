import Link from "next/link"
import { ArrowLeft } from "lucide-react"

/**
 * Consistent back-navigation affordance for inner academy screens. Every screen
 * reached by a selection should render one of these at the top so the learner is
 * never stranded without a way back to the level above.
 */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm text-editorial-muted transition-colors hover:text-editorial-ink"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  )
}
