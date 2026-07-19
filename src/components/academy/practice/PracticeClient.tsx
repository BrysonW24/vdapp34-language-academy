"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessagesSquare, Layers, PencilLine, Volume2 } from "lucide-react"
import { DialogueDrill, type DialogueData } from "./DialogueDrill"
import { PhraseFlashcard, type FlashDeck } from "./PhraseFlashcard"
import { SentenceFillIn, type FillItem } from "./SentenceFillIn"

export interface PracticeData {
  language: string
  languageName: string
  dialogues: DialogueData[]
  flashDecks: FlashDeck[]
  flashSource: "phrases" | "words"
  fillItems: FillItem[]
}

function Picker<T extends { id: string; label: string }>({
  items,
  activeId,
  onPick,
}: {
  items: T[]
  activeId: string
  onPick: (id: string) => void
}) {
  if (items.length <= 1) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onPick(item.id)}
          className={
            "rounded-full px-3 py-1.5 text-xs font-medium border transition-all " +
            (activeId === item.id
              ? "border-editorial-green bg-editorial-green-soft text-editorial-green"
              : "border-[rgba(44,49,59,0.12)] bg-white/60 text-editorial-muted hover:text-editorial-ink")
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

/**
 * Tabbed practice surface. Surfaces only the drills the current language has
 * content for, with a picker per drill so the learner chooses which
 * conversation / deck / pattern set to work through.
 */
export function PracticeClient({ data }: { data: PracticeData }) {
  const hasDialogue = data.dialogues.length > 0
  const hasFlash = data.flashDecks.length > 0
  const hasFill = data.fillItems.length > 0

  const [dialogueId, setDialogueId] = useState(data.dialogues[0]?.id ?? "")
  const [deckId, setDeckId] = useState(data.flashDecks[0]?.id ?? "")

  const firstTab = hasDialogue ? "dialogue" : hasFlash ? "flashcards" : "fillin"
  const [tab, setTab] = useState(firstTab)

  const activeDialogue = data.dialogues.find((d) => d.id === dialogueId) ?? data.dialogues[0]
  const activeDeck = data.flashDecks.find((d) => d.id === deckId) ?? data.flashDecks[0]

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-2">
      <TabsList>
        {hasDialogue ? (
          <TabsTrigger value="dialogue">
            <MessagesSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Conversation</span>
          </TabsTrigger>
        ) : null}
        {hasFlash ? (
          <TabsTrigger value="flashcards">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Flashcards</span>
          </TabsTrigger>
        ) : null}
        {hasFill ? (
          <TabsTrigger value="fillin">
            <PencilLine className="h-4 w-4" />
            <span className="hidden sm:inline">Fill in</span>
          </TabsTrigger>
        ) : null}
      </TabsList>

      {hasDialogue && activeDialogue ? (
        <TabsContent value="dialogue" className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-editorial-muted">
            <Volume2 className="h-4 w-4 text-editorial-green" />
            Step through a real conversation. Tap any line to hear it spoken.
          </div>
          <Picker items={data.dialogues} activeId={activeDialogue.id} onPick={setDialogueId} />
          <DialogueDrill key={activeDialogue.id} dialogue={activeDialogue} language={data.language} />
        </TabsContent>
      ) : null}

      {hasFlash && activeDeck ? (
        <TabsContent value="flashcards" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-editorial-muted">
              {data.flashSource === "phrases"
                ? "Flip phrase cards. Hear the phrase, then check the meaning."
                : "Flip word cards. Hear the word, then check the meaning."}
            </p>
            <Badge variant="outline">{data.flashSource === "phrases" ? "Phrases" : "Words"}</Badge>
          </div>
          <Picker items={data.flashDecks} activeId={activeDeck.id} onPick={setDeckId} />
          <PhraseFlashcard key={activeDeck.id} deck={activeDeck} language={data.language} />
        </TabsContent>
      ) : null}

      {hasFill ? (
        <TabsContent value="fillin" className="space-y-4">
          <p className="text-sm text-editorial-muted">
            Complete each sentence from a real grammar pattern, then hear the full line.
          </p>
          <SentenceFillIn items={data.fillItems} language={data.language} />
        </TabsContent>
      ) : null}
    </Tabs>
  )
}
