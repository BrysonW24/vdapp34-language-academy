import { NextResponse } from "next/server"
import { elevenLabsLang, ELEVENLABS_BASE, type AcademyVoice, type VoiceListResponse } from "@/lib/voices"

export const dynamic = "force-dynamic"

interface ElevenVerifiedLanguage {
  language?: string
  locale?: string
  accent?: string
}
interface ElevenLabsVoice {
  voice_id: string
  name: string
  category?: string
  preview_url?: string
  labels?: Record<string, string>
  verified_languages?: ElevenVerifiedLanguage[]
}

// Short-lived in-memory cache so repeated picker opens do not re-hit ElevenLabs.
const cache = new Map<string, { at: number; data: VoiceListResponse }>()
const CACHE_MS = 5 * 60 * 1000

export async function GET(request: Request) {
  const url = new URL(request.url)
  const appLang = url.searchParams.get("lang") ?? ""
  const iso = elevenLabsLang(appLang)

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    // No key: premium voices are simply unavailable; client uses Web Speech.
    return NextResponse.json({ available: false, voices: [], hasNative: false } satisfies VoiceListResponse)
  }

  const cached = cache.get(iso)
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return NextResponse.json(cached.data)
  }

  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices`, {
      headers: { "xi-api-key": apiKey },
    })
    if (!res.ok) {
      return NextResponse.json({ available: false, voices: [], hasNative: false } satisfies VoiceListResponse)
    }
    const data = (await res.json()) as { voices?: ElevenLabsVoice[] }
    const voices = data.voices ?? []

    const mapped = voices
      .map((v): (AcademyVoice & { speaks: boolean }) | null => {
        const verified = v.verified_languages?.find((l) => l.language === iso)
        const primary = v.labels?.language === iso
        const accent = verified?.accent
        // A real regional accent (not the generic "standard" multilingual render).
        const regional = Boolean(accent && accent.toLowerCase() !== "standard")
        const nativeMatch = primary || regional
        const speaks = primary || Boolean(verified)
        if (!speaks) return null
        return {
          voiceId: v.voice_id,
          name: v.name,
          gender: v.labels?.gender,
          previewUrl: v.preview_url,
          nativeMatch,
          multilingual: !nativeMatch,
          region: nativeMatch ? accent ?? verified?.locale ?? v.labels?.accent : undefined,
          baseAccent: v.labels?.accent,
          speaks,
        }
      })
      .filter((v): v is AcademyVoice & { speaks: boolean } => v !== null)

    // Native voices first, then multilingual-capable ones, all honestly labelled.
    const native = mapped.filter((v) => v.nativeMatch)
    const other = mapped.filter((v) => !v.nativeMatch)
    const chosen: AcademyVoice[] = [...native, ...other].slice(0, 24).map(({ speaks: _speaks, ...v }) => v)

    const payload: VoiceListResponse = { available: true, voices: chosen, hasNative: native.length > 0 }
    cache.set(iso, { at: Date.now(), data: payload })
    return NextResponse.json(payload)
  } catch (err) {
    console.error("[voices] ElevenLabs fetch failed:", err)
    return NextResponse.json({ available: false, voices: [], hasNative: false } satisfies VoiceListResponse)
  }
}
