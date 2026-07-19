"use client"

import { useMemo, useRef, useState } from "react"
import { Mic, Send, Volume2, RotateCcw, Sparkles, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTTS } from "@/hooks/useTTS"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import {
  scoreAttempt,
  scoreLabel,
  type CoachLine,
  type CoachPhrase,
  type CoachResponse,
  type CoachScenario,
} from "@/lib/coach"

interface Turn {
  role: "partner" | "learner"
  native: string
  english?: string
  transliteration?: string
  score?: number
}

interface ConversationCoachProps {
  language: string
  languageName: string
  accent: string
  gradient: string
  scenarios: CoachScenario[]
  initialScenarioSlug: string
  initial: CoachResponse
}

async function fetchTurn(body: {
  language: string
  scenarioSlug: string
  turnIndex: number
  history: CoachLine[]
}): Promise<CoachResponse> {
  const res = await fetch("/api/coach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`coach ${res.status}`)
  return (await res.json()) as CoachResponse
}

export function ConversationCoach({
  language,
  languageName,
  accent,
  gradient,
  scenarios,
  initialScenarioSlug,
  initial,
}: ConversationCoachProps) {
  const tts = useTTS()
  const [scenarioSlug, setScenarioSlug] = useState(initialScenarioSlug)
  const [turns, setTurns] = useState<Turn[]>([{ role: "partner", ...initial.partner }])
  const [say, setSay] = useState<CoachPhrase | null>(initial.say)
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(initial.done)
  const [source, setSource] = useState<CoachResponse["source"]>(initial.source)
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const speak = (text: string) => tts.speak(text, language, { rate: 0.85 })

  function appendAndScroll(updater: (prev: Turn[]) => Turn[]) {
    setTurns(updater)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
    })
  }

  async function submitLine(said: string) {
    const text = said.trim()
    if (!text || !say || loading || done) return

    const score = scoreAttempt(text, say.native)
    const learnerTurn: Turn = { role: "learner", native: text, score }
    appendAndScroll((prev) => [...prev, learnerTurn])
    setInput("")
    setSay(null)
    setLoading(true)
    setError(null)

    const history: CoachLine[] = [...turns, learnerTurn].map((t) => ({
      role: t.role,
      native: t.native,
      english: t.english,
      transliteration: t.transliteration,
    }))

    try {
      const next = await fetchTurn({ language, scenarioSlug, turnIndex: step + 1, history })
      appendAndScroll((prev) => [...prev, { role: "partner", ...next.partner }])
      setSay(next.say)
      setDone(next.done)
      setSource(next.source)
      setStep(step + 1)
      speak(next.partner.native)
    } catch {
      setError("Could not reach the coach. Please try again.")
      setSay(say) // restore the prompt so the learner can retry
    } finally {
      setLoading(false)
    }
  }

  const sr = useSpeechRecognition(language, submitLine)

  async function startScenario(slug: string) {
    setLoading(true)
    setError(null)
    sr.reset()
    try {
      const first = await fetchTurn({ language, scenarioSlug: slug, turnIndex: 0, history: [] })
      setScenarioSlug(slug)
      setTurns([{ role: "partner", ...first.partner }])
      setSay(first.say)
      setStep(0)
      setDone(first.done)
      setSource(first.source)
      setInput("")
      speak(first.partner.native)
    } catch {
      setError("Could not start that scenario.")
    } finally {
      setLoading(false)
    }
  }

  const learnerScores = useMemo(
    () => turns.filter((t) => t.role === "learner" && typeof t.score === "number").map((t) => t.score as number),
    [turns]
  )
  const avgScore =
    learnerScores.length > 0
      ? Math.round(learnerScores.reduce((a, b) => a + b, 0) / learnerScores.length)
      : null

  const toggleMic = () => (sr.listening ? sr.stop() : sr.start())

  return (
    <div className="space-y-3">
      {/* Scenario + mode bar */}
      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="coach-scenario">
          Scenario
        </label>
        <select
          id="coach-scenario"
          value={scenarioSlug}
          onChange={(e) => startScenario(e.target.value)}
          disabled={loading}
          className="min-w-0 flex-1 truncate rounded-full border border-[rgba(44,49,59,0.12)] bg-white/70 px-3 py-1.5 text-[13px] font-medium text-editorial-ink"
        >
          {scenarios.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        <span
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold"
          style={{ backgroundColor: `${accent}14`, color: accent }}
          title={source === "ai" ? "Live AI conversation" : "Guided practice from real dialogues"}
        >
          <Sparkles className="h-3 w-3" />
          {source === "ai" ? "AI" : "Practice"}
        </span>
      </div>

      {/* Transcript: a real chat thread */}
      <div
        ref={scrollRef}
        className="min-h-[40vh] max-h-[56vh] space-y-1.5 overflow-y-auto rounded-[14px] bg-[rgba(44,49,59,0.025)] px-2 py-2"
      >
        {turns.map((turn, i) =>
          turn.role === "partner" ? (
            <div key={i} className="flex justify-start">
              <div className="max-w-[82%] rounded-[14px] rounded-tl-[4px] bg-white/90 px-3 py-1.5 shadow-editorial-soft">
                <div className="flex items-start gap-2">
                  <p className="text-sm font-medium text-editorial-ink">{turn.native}</p>
                  <button
                    type="button"
                    onClick={() => speak(turn.native)}
                    aria-label="Hear it"
                    className="mt-0.5 flex-shrink-0 text-editorial-muted transition-colors hover:text-editorial-ink"
                  >
                    <Volume2 className={cn("h-3.5 w-3.5", tts.speakingText === turn.native && "text-editorial-green")} />
                  </button>
                </div>
                {turn.transliteration && (
                  <p className="text-[11px] italic leading-tight text-editorial-muted">{turn.transliteration}</p>
                )}
                {turn.english && <p className="text-[11px] leading-tight text-editorial-muted">{turn.english}</p>}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-end">
              <div
                className="max-w-[82%] rounded-[14px] rounded-tr-[4px] px-3 py-1.5 text-white"
                style={{ backgroundImage: gradient }}
              >
                <p className="text-sm font-medium">{turn.native}</p>
                {typeof turn.score === "number" && (
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90">
                    {scoreLabel(turn.score).label} · {turn.score}%
                  </p>
                )}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-[14px] rounded-tl-[4px] bg-white/85 px-3 py-2 text-sm text-editorial-muted shadow-editorial-soft">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-editorial-muted [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-editorial-muted [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-editorial-muted" />
              </span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[12px] text-editorial-amber">{error}</p>}

      {/* Composer: a slim "say this" hint above a chat input bar */}
      {say && !done ? (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => speak(say.native)}
            className="flex w-full items-center gap-2 rounded-[12px] px-2.5 py-1.5 text-left transition-colors"
            style={{ backgroundColor: `${accent}12` }}
          >
            <span
              className="flex-shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide"
              style={{ backgroundColor: `${accent}24`, color: accent }}
            >
              Say
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-semibold text-editorial-ink">{say.native}</span>
              {(say.english || say.transliteration) && (
                <span className="block truncate text-[10px] text-editorial-muted">
                  {[say.transliteration, say.english].filter(Boolean).join(" · ")}
                </span>
              )}
            </span>
            <Volume2
              className={cn("h-4 w-4 flex-shrink-0", tts.speakingText === say.native ? "text-editorial-green" : "text-editorial-muted")}
            />
          </button>

          {sr.listening && sr.interim && <p className="px-1 text-[12px] text-editorial-ink">{sr.interim}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMic}
              disabled={loading}
              aria-label={sr.listening ? "Stop" : "Speak"}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-50"
              style={{ backgroundImage: sr.listening ? undefined : gradient, backgroundColor: sr.listening ? "#b5271f" : undefined }}
            >
              {sr.listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitLine(input)
              }}
              placeholder={`Read it aloud, or type in ${languageName}...`}
              disabled={loading}
              className="min-w-0 flex-1 rounded-full border border-[rgba(44,49,59,0.12)] bg-white/80 px-3 py-2 text-sm text-editorial-ink outline-none focus:border-[rgba(44,49,59,0.25)]"
            />
            <button
              type="button"
              onClick={() => submitLine(input)}
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-all disabled:opacity-40"
              style={{ backgroundImage: gradient }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 rounded-[16px] border border-[rgba(44,49,59,0.08)] bg-white/60 p-4 text-center">
          <p className="font-serif text-base font-semibold text-editorial-ink">Conversation complete</p>
          <p className="text-sm text-editorial-muted">
            {learnerScores.length > 0
              ? `You practised ${learnerScores.length} line${learnerScores.length === 1 ? "" : "s"}${avgScore !== null ? `, averaging ${avgScore}%` : ""}. Nicely done.`
              : "Nicely done."}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => startScenario(scenarioSlug)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ backgroundImage: gradient }}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Practise again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
