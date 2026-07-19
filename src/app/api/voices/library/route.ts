import { NextResponse } from "next/server"
import { elevenLabsLang, ELEVENLABS_BASE, type LibraryResponse, type LibraryVoice } from "@/lib/voices"

export const dynamic = "force-dynamic"

interface SharedVoice {
  public_owner_id: string
  voice_id: string
  name: string
  accent?: string
  locale?: string
  gender?: string
  age?: string
  preview_url?: string
  description?: string
  language?: string
}

const cache = new Map<string, { at: number; data: LibraryResponse }>()
const CACHE_MS = 10 * 60 * 1000

/**
 * GET /api/voices/library?lang=es&accent=...
 * Browses the ElevenLabs public Voice Library for voices native to the
 * language, so the learner can add a real regional voice from inside the app.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const iso = elevenLabsLang(url.searchParams.get("lang") ?? "")
  const accent = url.searchParams.get("accent")?.trim() ?? ""

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ available: false, voices: [] } satisfies LibraryResponse)
  }

  const cacheKey = `${iso}:${accent}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json(cached.data)
  }

  try {
    const params = new URLSearchParams({ language: iso, page_size: "30" })
    if (accent) params.set("accent", accent)
    const res = await fetch(`${ELEVENLABS_BASE}/shared-voices?${params.toString()}`, {
      headers: { "xi-api-key": apiKey },
    })
    if (!res.ok) {
      return NextResponse.json({ available: false, voices: [] } satisfies LibraryResponse)
    }
    const data = (await res.json()) as { voices?: SharedVoice[] }
    const voices: LibraryVoice[] = (data.voices ?? []).slice(0, 30).map((v) => ({
      publicOwnerId: v.public_owner_id,
      voiceId: v.voice_id,
      name: v.name,
      accent: v.accent,
      locale: v.locale,
      gender: v.gender,
      age: v.age,
      previewUrl: v.preview_url,
      description: v.description,
    }))

    const payload: LibraryResponse = { available: true, voices }
    cache.set(cacheKey, { at: Date.now(), data: payload })
    return NextResponse.json(payload)
  } catch (err) {
    console.error("[voices/library] fetch failed:", err)
    return NextResponse.json({ available: false, voices: [] } satisfies LibraryResponse)
  }
}
