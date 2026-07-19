"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpeakButton } from "@/components/academy/SpeakButton"
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FillItem {
  id: string
  /** Native sentence with the target word replaced by "_____". */
  prompt: string
  /** The word that was blanked out. */
  answer: string
  /** English translation, shown as a hint. */
  hint: string
  /** Grammar rule this sentence demonstrates. */
  rule: string
  /** Full native sentence, revealed after answering. */
  full: string
}

interface SentenceFillInProps {
  items: FillItem[]
  language: string
}

function normalise(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:¿¡"']/g, "")
}

/**
 * Type-the-blank grammar drill. One word is removed from a real example
 * sentence; the learner types it back, using the English translation as a cue.
 * After answering, the full sentence can be heard aloud.
 */
export function SentenceFillIn({ items, language }: SentenceFillInProps) {
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const item = items[index]
  if (!item) return null

  const isCorrect = normalise(value) === normalise(item.answer)

  function check() {
    if (showResult) return
    setShowResult(true)
    if (isCorrect) setScore((s) => s + 1)
  }

  function next() {
    if (index + 1 >= items.length) {
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setValue("")
    setShowResult(false)
  }

  function restart() {
    setIndex(0)
    setValue("")
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-3xl font-serif font-semibold text-editorial-ink">
            {score} / {items.length}
          </div>
          <p className="text-editorial-muted">
            {score === items.length
              ? "Every blank correct. Your pattern recall is solid."
              : "Review the patterns you missed and run it again."}
          </p>
          <Button onClick={restart} variant="secondary">
            <RotateCcw className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">
            Sentence {index + 1} of {items.length}
          </Badge>
          <Badge variant="outline">{item.rule}</Badge>
        </div>

        <div className="space-y-1">
          <p className="text-lg font-serif font-semibold text-editorial-ink leading-relaxed">
            {item.prompt}
          </p>
          <p className="text-sm text-editorial-muted">{item.hint}</p>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !showResult && check()}
          placeholder="Fill in the blank..."
          disabled={showResult}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full px-4 py-3 rounded-[12px] border border-[rgba(44,49,59,0.12)] bg-white/50 text-editorial-ink text-sm outline-none focus:border-editorial-green focus:ring-2 focus:ring-editorial-green/20 transition-all"
        />

        {showResult ? (
          <div
            className={cn(
              "p-4 rounded-[12px] space-y-2",
              isCorrect ? "bg-editorial-green-soft/50" : "bg-editorial-red-soft/50"
            )}
          >
            <div className="flex items-start gap-3">
              {isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-editorial-green flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-editorial-red flex-shrink-0 mt-0.5" />
              )}
              <p className={cn("text-sm font-medium", isCorrect ? "text-editorial-green" : "text-editorial-red")}>
                {isCorrect ? "Correct!" : `The answer is: ${item.answer}`}
              </p>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <p className="text-sm text-editorial-ink font-serif">{item.full}</p>
              <SpeakButton text={item.full} language={language} size="sm" />
            </div>
          </div>
        ) : null}

        <div className="flex justify-end">
          {!showResult ? (
            <Button onClick={check} disabled={!value.trim()}>
              Check
            </Button>
          ) : (
            <Button onClick={next}>{index + 1 >= items.length ? "Finish" : "Next"}</Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
