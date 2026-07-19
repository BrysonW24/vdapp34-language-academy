import { describe, expect, it } from "vitest"
import {
  getLanguageGuideIndexItems,
  getMeaningLoadGuide,
  getPhraseToPatternGuide,
  getSentenceSkeletonGuide,
  getVisualGuideHref,
  VISUAL_GUIDE_ORDER,
} from "@/lib/visual-guides"
import { getLanguageSwitchHref, SUPPORTED_LANGUAGES } from "@/lib/languages"

describe("visual guides", () => {
  it("has all three guide slugs in the intended order", () => {
    expect(VISUAL_GUIDE_ORDER).toEqual([
      "sentence-skeleton",
      "phrase-to-pattern",
      "meaning-load",
    ])
  })

  it("provides guide content for every supported language", () => {
    SUPPORTED_LANGUAGES.forEach((language) => {
      expect(getSentenceSkeletonGuide(language).title).toBeDefined()
      expect(getPhraseToPatternGuide(language).title).toBeDefined()
      expect(getMeaningLoadGuide(language).title).toBeDefined()
    })
  })

  it("builds a full guide index for each supported language", () => {
    SUPPORTED_LANGUAGES.forEach((language) => {
      const items = getLanguageGuideIndexItems(language)
      expect(items).toHaveLength(3)
      expect(items[0]?.href).toBe(getVisualGuideHref(language, "sentence-skeleton"))
      expect(items[1]?.href).toBe(getVisualGuideHref(language, "phrase-to-pattern"))
      expect(items[2]?.href).toBe(getVisualGuideHref(language, "meaning-load"))
    })
  })

  it("preserves guide subroutes when switching languages", () => {
    expect(getLanguageSwitchHref("/es/guides/sentence-skeleton", "de")).toBe(
      "/de/guides/sentence-skeleton"
    )
    expect(getLanguageSwitchHref("/zh/guides/meaning-load", "th")).toBe(
      "/th/guides/meaning-load"
    )
  })
})
