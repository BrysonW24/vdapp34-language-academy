import { describe, expect, it } from "vitest"
import { SUPPORTED_LANGUAGES } from "@/lib/languages"
import { getTimelinePlan } from "@/lib/timeline-plan"

describe("timeline plan", () => {
  it("builds a five-stage path for every supported language", () => {
    SUPPORTED_LANGUAGES.forEach((language) => {
      const plan = getTimelinePlan(language)

      expect(plan.startHref).toBe("/speaking-structure")
      expect(plan.stages).toHaveLength(5)
      expect(plan.stats).toHaveLength(5)

      plan.stages.forEach((stage) => {
        expect(stage.actions.length).toBeGreaterThan(1)
        stage.actions.forEach((action) => {
          expect(action.href.startsWith("/")).toBe(true)
          expect(action.label.length).toBeGreaterThan(0)
        })
      })
    })
  })

  it("keeps the final stage grounded in the guide system for review", () => {
    SUPPORTED_LANGUAGES.forEach((language) => {
      const plan = getTimelinePlan(language)
      const finalStage = plan.stages[4]

      expect(finalStage?.actions.some((action) => action.href === `/${language}/guides`)).toBe(true)
    })
  })
})
