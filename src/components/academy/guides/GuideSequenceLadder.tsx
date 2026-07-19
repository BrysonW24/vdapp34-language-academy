interface SequenceStep {
  stage: string
  form: string
  explanation: string
}

interface GuideSequenceLadderProps {
  steps: SequenceStep[]
  accent: string
}

export function GuideSequenceLadder({ steps, accent }: GuideSequenceLadderProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={`${step.stage}-${index}`}
          className="grid grid-cols-[auto_1fr] gap-4 rounded-[22px] border border-[rgba(44,49,59,0.08)] bg-white/72 p-4"
        >
          <div className="flex flex-col items-center">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: `${accent}15`, color: accent }}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="mt-2 h-full min-h-8 w-px bg-[rgba(44,49,59,0.12)]" />
            )}
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-editorial-muted">
                {step.stage}
              </span>
              <span
                className="inline-flex rounded-full px-3 py-1 text-sm font-medium"
                style={{ backgroundColor: `${accent}12`, color: accent }}
              >
                {step.form}
              </span>
            </div>
            <p className="text-sm sm:text-base text-editorial-ink leading-relaxed">{step.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
