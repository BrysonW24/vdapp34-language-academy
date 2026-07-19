import { ELEVENLABS_BASE, ELEVENLABS_MODEL, TTS_MAX_CHARS } from "@/lib/voices"

export const dynamic = "force-dynamic"

// Cache synthesized audio by voice+text so replaying a word does not re-charge
// ElevenLabs. Bounded so it cannot grow without limit.
const audioCache = new Map<string, ArrayBuffer>()
const MAX_CACHE_ENTRIES = 400

function cacheKey(voiceId: string, text: string): string {
  return `${voiceId}::${text}`
}

/**
 * GET /api/tts?voiceId=...&text=...  -> audio/mpeg
 *
 * GET (not POST) so the client can assign the URL straight to an <audio> src
 * inside the tap handler, which is what iOS requires for autoplay, and so the
 * browser can cache identical requests.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const voiceId = url.searchParams.get("voiceId") ?? ""
  const text = (url.searchParams.get("text") ?? "").slice(0, TTS_MAX_CHARS)

  if (!voiceId || !text.trim()) {
    return new Response("Missing voiceId or text", { status: 400 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    // No key: signal unavailable so the client falls back to Web Speech.
    return new Response("Premium voices not configured", { status: 503 })
  }

  const key = cacheKey(voiceId, text)
  const cached = audioCache.get(key)
  if (cached) {
    return new Response(cached, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  }

  try {
    const res = await fetch(
      `${ELEVENLABS_BASE}/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: ELEVENLABS_MODEL,
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      }
    )

    if (!res.ok) {
      console.error("[tts] ElevenLabs error", res.status, await res.text().catch(() => ""))
      return new Response("Synthesis failed", { status: 502 })
    }

    const audio = await res.arrayBuffer()

    if (audioCache.size >= MAX_CACHE_ENTRIES) {
      const oldest = audioCache.keys().next().value
      if (oldest) audioCache.delete(oldest)
    }
    audioCache.set(key, audio)

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    console.error("[tts] request failed:", err)
    return new Response("Synthesis error", { status: 502 })
  }
}
