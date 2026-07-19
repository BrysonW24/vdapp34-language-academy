import { NextResponse } from "next/server"
import { getLanguageConfig, isSupportedLanguage, type SupportedLanguage } from "@/lib/languages"
import {
  buildCoachSystemPrompt,
  transcriptForModel,
  SCRIPT_LANGUAGES,
  type CoachLine,
  type CoachResponse,
} from "@/lib/coach"
import { offlineTurn, resolveScenario } from "@/lib/coach-offline"
import type { AcademyTopic } from "@/types/academy"

export const dynamic = "force-dynamic"

interface CoachRequest {
  language: string
  scenarioSlug?: string
  /** 0-based conversation step the client is requesting. */
  turnIndex?: number
  history?: CoachLine[]
}

const ANTHROPIC_MODEL = process.env.COACH_MODEL ?? "claude-haiku-4-5-20251001"
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

export async function POST(request: Request) {
  let body: CoachRequest
  try {
    body = (await request.json()) as CoachRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { language } = body
  if (!language || !isSupportedLanguage(language)) {
    return NextResponse.json({ error: "Unknown or missing language" }, { status: 400 })
  }

  const lang = language as SupportedLanguage
  const turnIndex = Math.max(0, Math.floor(body.turnIndex ?? 0))
  const history = Array.isArray(body.history) ? body.history : []

  const scenario = resolveScenario(lang, body.scenarioSlug)
  if (!scenario) {
    return NextResponse.json({ error: "No conversation scenarios available for this language" }, { status: 404 })
  }

  // Live model path. On any failure we fall through to the offline replay so the
  // conversation loop never dead-ends (fail closed on the provider, keep moving).
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (apiKey) {
    try {
      const aiTurn = await runModelTurn(apiKey, lang, scenario, history)
      if (aiTurn) return NextResponse.json(aiTurn)
    } catch (err) {
      console.error("[coach] model turn failed, falling back to offline:", err)
    }
  }

  return NextResponse.json(offlineTurn(scenario, turnIndex))
}

interface AnthropicTextBlock {
  type: string
  text?: string
}
interface AnthropicResponse {
  content?: AnthropicTextBlock[]
}

async function runModelTurn(
  apiKey: string,
  lang: SupportedLanguage,
  topic: AcademyTopic,
  history: CoachLine[]
): Promise<CoachResponse | null> {
  const config = getLanguageConfig(lang)!
  const isScript = SCRIPT_LANGUAGES.has(lang)
  const system = buildCoachSystemPrompt(config.learningName, topic.title, isScript)
  const userTurn = transcriptForModel(history, topic.dialogue.setup)

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system,
      messages: [{ role: "user", content: userTurn }],
    }),
  })

  if (!res.ok) {
    throw new Error(`Anthropic ${res.status}: ${await res.text().catch(() => "")}`)
  }

  const data = (await res.json()) as AnthropicResponse
  const text = data.content?.find((b) => b.type === "text")?.text ?? ""
  const parsed = parseModelJson(text)
  if (!parsed) return null

  return {
    partner: {
      native: parsed.partnerNative,
      english: parsed.partnerEnglish,
      transliteration: isScript ? parsed.partnerTranslit : undefined,
    },
    say: parsed.sayNative
      ? {
          native: parsed.sayNative,
          english: parsed.sayEnglish ?? "",
          transliteration: isScript ? parsed.sayTranslit : undefined,
        }
      : null,
    done: false,
    source: "ai",
    scenarioLabel: topic.title,
  }
}

interface ModelJson {
  partnerNative: string
  partnerEnglish: string
  partnerTranslit?: string
  sayNative: string
  sayEnglish?: string
  sayTranslit?: string
}

/** Tolerantly extract the JSON object from the model's text reply. */
function parseModelJson(text: string): ModelJson | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim()
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null
  try {
    const obj = JSON.parse(cleaned.slice(start, end + 1)) as ModelJson
    if (!obj.partnerNative || !obj.sayNative) return null
    return obj
  } catch {
    return null
  }
}
