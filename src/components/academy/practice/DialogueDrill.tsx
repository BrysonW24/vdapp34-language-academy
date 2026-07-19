"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpeakButton } from "@/components/academy/SpeakButton"
import { Eye, RotateCcw, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DialogueLine {
  speaker: string
  native: string
  english: string
  secondary?: string
}

export interface DialogueData {
  id: string
  label: string
  setup: string
  roles: string[]
  lines: DialogueLine[]
}

interface DialogueDrillProps {
  dialogue: DialogueData
  language: string
}

/**
 * Step-through conversational role-play. The learner picks a role (or just
 * listens), then walks the conversation one line at a time. Their own lines are
 * hidden behind a "Reveal" so they can attempt the line first; every line can
 * be heard aloud in the target accent.
 */
export function DialogueDrill({ dialogue, language }: DialogueDrillProps) {
  const [role, setRole] = useState<string>(dialogue.roles[0] ?? "")
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)

  // Reset the walk whenever the role changes.
  const lines = dialogue.lines
  const current = lines[index]
  const finished = index >= lines.length

  function chooseRole(next: string) {
    setRole(next)
    setIndex(0)
    setRevealed(false)
  }

  function advance() {
    setIndex((i) => i + 1)
    setRevealed(false)
  }

  function restart() {
    setIndex(0)
    setRevealed(false)
  }

  const transcript = useMemo(() => lines.slice(0, index), [lines, index])

  return (
    <Card>
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div className="space-y-3">
          <div className="flex items-start gap-2.5">
            <MessageSquare className="h-4 w-4 text-editorial-green flex-shrink-0 mt-1" />
            <p className="text-sm text-editorial-muted leading-relaxed">{dialogue.setup}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-editorial-muted">Play as:</span>
            {dialogue.roles.map((r) => (
              <button
                key={r}
                onClick={() => chooseRole(r)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                  role === r
                    ? "border-editorial-green bg-editorial-green-soft text-editorial-green"
                    : "border-[rgba(44,49,59,0.12)] bg-white/60 text-editorial-muted hover:text-editorial-ink"
                )}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => chooseRole("")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                role === ""
                  ? "border-editorial-green bg-editorial-green-soft text-editorial-green"
                  : "border-[rgba(44,49,59,0.12)] bg-white/60 text-editorial-muted hover:text-editorial-ink"
              )}
            >
              Just listen
            </button>
          </div>
        </div>

        {/* Transcript so far */}
        <div className="space-y-3">
          {transcript.map((line, i) => (
            <ChatBubble key={i} line={line} role={role} language={language} />
          ))}

          {/* Active line */}
          {!finished && current ? (
            <ActiveLine
              line={current}
              isLearnerLine={role !== "" && current.speaker === role}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onContinue={advance}
              language={language}
            />
          ) : null}
        </div>

        {finished ? (
          <div className="text-center space-y-3 pt-2">
            <p className="text-sm text-editorial-muted">
              End of conversation. Replay it, or switch roles to practise the other side.
            </p>
            <Button onClick={restart} variant="secondary">
              <RotateCcw className="h-4 w-4 mr-2" />
              Replay
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function ChatBubble({
  line,
  role,
  language,
}: {
  line: DialogueLine
  role: string
  language: string
}) {
  const isLearner = role !== "" && line.speaker === role
  return (
    <div className={cn("flex flex-col gap-1", isLearner ? "items-end" : "items-start")}>
      <span className="text-[11px] font-medium uppercase tracking-wide text-editorial-muted px-1">
        {line.speaker}
      </span>
      <div
        className={cn(
          "max-w-[85%] rounded-[14px] px-4 py-2.5 border",
          isLearner
            ? "bg-editorial-green-soft border-editorial-green/30"
            : "bg-white/70 border-[rgba(44,49,59,0.08)]"
        )}
      >
        <div className="flex items-center gap-2">
          <p className="font-serif font-medium text-editorial-ink">{line.native}</p>
          <SpeakButton text={line.native} language={language} size="sm" />
        </div>
        {line.secondary ? (
          <p className="text-xs text-editorial-muted mt-0.5">{line.secondary}</p>
        ) : null}
        <p className="text-sm text-editorial-muted mt-0.5">{line.english}</p>
      </div>
    </div>
  )
}

function ActiveLine({
  line,
  isLearnerLine,
  revealed,
  onReveal,
  onContinue,
  language,
}: {
  line: DialogueLine
  isLearnerLine: boolean
  revealed: boolean
  onReveal: () => void
  onContinue: () => void
  language: string
}) {
  // Lines that aren't the learner's are shown immediately.
  const showNative = !isLearnerLine || revealed

  return (
    <div
      className={cn(
        "rounded-[14px] border-2 border-dashed p-4 space-y-3",
        isLearnerLine ? "border-editorial-green/40 bg-editorial-green-soft/30" : "border-[rgba(44,49,59,0.12)] bg-white/40"
      )}
    >
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{line.speaker}</Badge>
        {isLearnerLine ? (
          <span className="text-[11px] font-medium text-editorial-green">Your line</span>
        ) : null}
      </div>

      {isLearnerLine && !revealed ? (
        <div className="space-y-1">
          <p className="text-sm text-editorial-muted">How would you say:</p>
          <p className="font-serif font-medium text-editorial-ink">{line.english}</p>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-lg font-serif font-semibold text-editorial-ink">{line.native}</p>
            <SpeakButton text={line.native} language={language} />
          </div>
          {line.secondary ? <p className="text-xs text-editorial-muted">{line.secondary}</p> : null}
          <p className="text-sm text-editorial-muted">{line.english}</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        {isLearnerLine && !revealed ? (
          <Button onClick={onReveal} variant="secondary" size="sm">
            <Eye className="h-4 w-4 mr-1.5" />
            Reveal
          </Button>
        ) : (
          <Button onClick={onContinue} size="sm">
            Continue
          </Button>
        )}
      </div>
    </div>
  )
}
