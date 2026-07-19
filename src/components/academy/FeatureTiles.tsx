import { Volume2, MessagesSquare } from "lucide-react"

/**
 * Light glass visualisation tiles for the home "why" band. Each value prop is
 * shown as a small visualisation of the real product (hearable words, a real
 * conversation, the frequency-first path) rather than a generic icon card.
 * Matches the Vivacity.ai brand-image style. Presentational, server-safe.
 */

const CARD =
  "relative overflow-hidden rounded-[18px] border border-white/70 bg-white/60 p-3.5 shadow-editorial-soft backdrop-blur-xl"
const SHEEN =
  "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"

const WORDS = [
  { term: "hola", pron: "OH-lah", en: "hello" },
  { term: "gracias", pron: "GRAH-thee-ahs", en: "thank you" },
  { term: "por favor", pron: "pohr fah-BOHR", en: "please" },
]

export function WordsTile() {
  return (
    <div className={CARD}>
      <div className={SHEEN} />
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-editorial-ink">Hear every word</p>
        <Volume2 className="h-3.5 w-3.5 text-editorial-green" />
      </div>
      <div className="space-y-1.5">
        {WORDS.map((w) => (
          <div
            key={w.term}
            className="flex items-center gap-2 rounded-[11px] border border-white/60 bg-white/70 px-2.5 py-1.5"
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-editorial-green-soft">
              <Volume2 className="h-3 w-3 text-editorial-green" />
            </span>
            <span className="font-serif text-[13px] font-semibold text-editorial-ink">{w.term}</span>
            <span className="font-mono text-[10px] text-editorial-muted">{w.pron}</span>
            <span className="ml-auto text-[11px] text-editorial-muted">{w.en}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ConversationTile() {
  return (
    <div className={CARD}>
      <div className={SHEEN} />
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-editorial-ink">Real conversations</p>
        <MessagesSquare className="h-3.5 w-3.5 text-editorial-green" />
      </div>
      <div className="space-y-1.5">
        <div className="max-w-[85%] rounded-[12px] rounded-tl-sm border border-[rgba(44,49,59,0.08)] bg-white/70 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <p className="font-serif text-[12px] font-medium text-editorial-ink">¿Cómo estás?</p>
            <Volume2 className="h-3 w-3 text-editorial-muted" />
          </div>
          <p className="text-[10px] text-editorial-muted">How are you?</p>
        </div>
        <div className="ml-auto max-w-[85%] rounded-[12px] rounded-tr-sm border border-editorial-green/25 bg-editorial-green-soft px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <p className="font-serif text-[12px] font-medium text-editorial-ink">Muy bien, gracias</p>
            <Volume2 className="h-3 w-3 text-editorial-green" />
          </div>
          <p className="text-[10px] text-editorial-muted">Very well, thank you</p>
        </div>
      </div>
    </div>
  )
}

const LADDER = [
  { label: "Essential 50", color: "#386a58" },
  { label: "Core 100", color: "#2f4f79" },
  { label: "Everyday 250", color: "#6d28d9" },
  { label: "Confident 350", color: "#a16a1f" },
  { label: "Fluent 250", color: "#a0453f" },
]

export function PathTile() {
  return (
    <div className={CARD}>
      <div className={SHEEN} />
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-editorial-ink">Frequency-first path</p>
        <span className="font-mono text-[9px] uppercase tracking-wider text-editorial-muted">1,000 words</span>
      </div>
      <div className="mb-2.5 flex h-2 overflow-hidden rounded-full">
        {LADDER.map((seg) => (
          <span key={seg.label} className="flex-1" style={{ backgroundColor: seg.color }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-1">
        {LADDER.map((seg) => (
          <span
            key={seg.label}
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${seg.color}14`, color: seg.color }}
          >
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  )
}
