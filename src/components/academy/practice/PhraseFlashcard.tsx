"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SpeakButton } from "@/components/academy/SpeakButton"
import { RotateCcw, Shuffle, Check, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FlashCardItem {
  front: string
  back: string
  pron?: string
  sub?: string
}

export interface FlashDeck {
  id: string
  label: string
  cards: FlashCardItem[]
}

interface PhraseFlashcardProps {
  deck: FlashDeck
  language: string
}

function shuffleIndices(length: number): number[] {
  const arr = Array.from({ length }, (_, i) => i)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Tap-to-flip flashcards. Front shows the native term (hearable in the target
 * accent); flipping reveals the English plus pronunciation so the learner can
 * check both meaning and how to say it. Tracks a simple known/review tally.
 */
export function PhraseFlashcard({ deck, language }: PhraseFlashcardProps) {
  const [order, setOrder] = useState<number[]>(() => deck.cards.map((_, i) => i))
  const [position, setPosition] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(0)
  const [reviewing, setReviewing] = useState(0)

  const total = deck.cards.length
  const card = useMemo(() => deck.cards[order[position]], [deck.cards, order, position])
  const finished = position >= total

  function mark(asKnown: boolean) {
    if (asKnown) setKnown((n) => n + 1)
    else setReviewing((n) => n + 1)
    setFlipped(false)
    setPosition((p) => p + 1)
  }

  function restart(shuffle = false) {
    setOrder(shuffle ? shuffleIndices(total) : deck.cards.map((_, i) => i))
    setPosition(0)
    setFlipped(false)
    setKnown(0)
    setReviewing(0)
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-3xl font-serif font-semibold text-editorial-ink">
            {known} / {total}
          </div>
          <p className="text-editorial-muted">
            {known === total
              ? "You knew every card. Shuffle and go again to keep them sharp."
              : `${reviewing} to review. Reshuffle and focus on the ones that slipped.`}
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => restart(true)}>
              <Shuffle className="h-4 w-4 mr-2" />
              Shuffle + restart
            </Button>
            <Button onClick={() => restart(false)} variant="secondary">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">
          Card {position + 1} of {total}
        </Badge>
        <button
          onClick={() => restart(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-editorial-muted hover:text-editorial-green transition-colors"
        >
          <Shuffle className="h-3.5 w-3.5" />
          Shuffle
        </button>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className={cn(
          "w-full min-h-[200px] rounded-[18px] border p-8 flex flex-col items-center justify-center gap-3 text-center transition-all",
          flipped
            ? "border-editorial-green/30 bg-editorial-green-soft/40"
            : "border-[rgba(44,49,59,0.1)] bg-white/70 hover:bg-white/90"
        )}
      >
        {!flipped ? (
          <>
            <div className="flex items-center gap-2.5">
              <span className="text-xl sm:text-2xl font-serif font-semibold text-editorial-ink">
                {card.front}
              </span>
              <SpeakButton text={card.front} language={language} />
            </div>
            {card.pron ? <span className="text-sm text-editorial-muted">{card.pron}</span> : null}
            <span className="text-xs text-editorial-muted/70 mt-2">Tap to reveal meaning</span>
          </>
        ) : (
          <>
            <span className="text-xl sm:text-2xl font-serif font-medium text-editorial-ink">
              {card.back}
            </span>
            {card.sub ? <span className="text-sm text-editorial-muted">{card.sub}</span> : null}
            <span className="text-xs text-editorial-muted/70 mt-2">Tap to flip back</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => mark(false)} variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Review again
        </Button>
        <Button onClick={() => mark(true)}>
          <Check className="h-4 w-4 mr-2" />
          Got it
        </Button>
      </div>
    </div>
  )
}
