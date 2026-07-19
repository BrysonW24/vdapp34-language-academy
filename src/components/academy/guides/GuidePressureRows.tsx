import { cn } from "@/lib/utils"

interface PressureRow {
  label: string
  value: number
  explanation: string
}

interface GuidePressureRowsProps {
  rows: PressureRow[]
  color: string
}

export function GuidePressureRows({ rows, color }: GuidePressureRowsProps) {
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.label} className="space-y-2">
          <div className="grid grid-cols-[88px_1fr_26px] items-center gap-3">
            <span className="text-sm text-editorial-muted">{row.label}</span>
            <div className="h-2.5 rounded-full bg-[rgba(44,49,59,0.08)] overflow-hidden">
              <div className={cn("h-full rounded-full")} style={{ width: `${(row.value / 5) * 100}%`, backgroundColor: color }} />
            </div>
            <span className="text-sm font-medium text-editorial-ink">{row.value}</span>
          </div>
          <p className="text-sm text-editorial-muted leading-relaxed pl-[101px]">{row.explanation}</p>
        </div>
      ))}
    </div>
  )
}
