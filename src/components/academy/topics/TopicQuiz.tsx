"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  type: "translate" | "fill-blank" | "multiple-choice" | "reorder"
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

interface TopicQuizProps {
  questions: QuizQuestion[]
  topicSlug: string
}

export function TopicQuiz({ questions, topicSlug }: TopicQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[currentIndex]
  if (!question) return null

  const isCorrect =
    question.type === "multiple-choice"
      ? selectedOption === question.correctAnswer
      : userAnswer.trim().toLowerCase() === question.correctAnswer.toLowerCase()

  function handleCheck() {
    if (showResult) return
    setShowResult(true)
    if (isCorrect) {
      setScore((s) => s + 1)
    }
  }

  function handleNext() {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true)
      return
    }
    setCurrentIndex((i) => i + 1)
    setUserAnswer("")
    setSelectedOption(null)
    setShowResult(false)
  }

  function handleRestart() {
    setCurrentIndex(0)
    setUserAnswer("")
    setSelectedOption(null)
    setShowResult(false)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-3xl font-serif font-semibold text-editorial-ink">
            {score} / {questions.length}
          </div>
          <p className="text-editorial-muted">
            {score === questions.length
              ? "Perfect score! You have mastered this topic."
              : score >= questions.length * 0.7
                ? "Great job! Review the ones you missed and try again."
                : "Keep practising! Review the topic material and try again."}
          </p>
          <Button onClick={handleRestart} variant="secondary">
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
            Question {currentIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline">{question.type.replace("-", " ")}</Badge>
        </div>

        <p className="text-lg font-serif font-semibold text-editorial-ink">
          {question.question}
        </p>

        {question.type === "multiple-choice" && question.options ? (
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option}
                onClick={() => !showResult && setSelectedOption(option)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-[12px] border text-sm transition-all duration-200",
                  showResult && option === question.correctAnswer
                    ? "border-editorial-green bg-editorial-green-soft text-editorial-green"
                    : showResult && option === selectedOption && option !== question.correctAnswer
                      ? "border-editorial-red bg-editorial-red-soft text-editorial-red"
                      : selectedOption === option
                        ? "border-editorial-green/40 bg-editorial-green-soft/50 text-editorial-ink"
                        : "border-[rgba(44,49,59,0.08)] bg-white/50 text-editorial-ink hover:bg-white/80"
                )}
                disabled={showResult}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !showResult && handleCheck()}
            placeholder="Type your answer..."
            disabled={showResult}
            className="w-full px-4 py-3 rounded-[12px] border border-[rgba(44,49,59,0.12)] bg-white/50 text-editorial-ink text-sm outline-none focus:border-editorial-green focus:ring-2 focus:ring-editorial-green/20 transition-all"
          />
        )}

        {showResult && (
          <div
            className={cn(
              "p-4 rounded-[12px] flex items-start gap-3",
              isCorrect ? "bg-editorial-green-soft/50" : "bg-editorial-red-soft/50"
            )}
          >
            {isCorrect ? (
              <CheckCircle2 className="h-5 w-5 text-editorial-green flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-editorial-red flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <p className={cn("text-sm font-medium", isCorrect ? "text-editorial-green" : "text-editorial-red")}>
                {isCorrect ? "Correct!" : `Incorrect. The answer is: ${question.correctAnswer}`}
              </p>
              <p className="text-sm text-editorial-muted">{question.explanation}</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          {!showResult ? (
            <Button
              onClick={handleCheck}
              disabled={question.type === "multiple-choice" ? !selectedOption : !userAnswer.trim()}
            >
              Check
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex + 1 >= questions.length ? "Finish" : "Next"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
