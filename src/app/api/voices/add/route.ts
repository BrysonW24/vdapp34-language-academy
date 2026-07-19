import { NextResponse } from "next/server"
import { ELEVENLABS_BASE, type AddVoiceResponse } from "@/lib/voices"

export const dynamic = "force-dynamic"

interface AddRequest {
  publicOwnerId?: string
  voiceId?: string
  name?: string
}

/**
 * POST /api/voices/add  { publicOwnerId, voiceId, name }
 * Adds a public Voice Library voice to the account so it can be used for TTS.
 * Returns the new in-account voiceId. Errors (e.g. voice-limit reached) come
 * back as { ok: false, error } with 200 so the client can show the message.
 */
export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Premium voices are not configured." } satisfies AddVoiceResponse, {
      status: 503,
    })
  }

  let body: AddRequest
  try {
    body = (await request.json()) as AddRequest
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." } satisfies AddVoiceResponse, { status: 400 })
  }

  const { publicOwnerId, voiceId, name } = body
  if (!publicOwnerId || !voiceId || !name) {
    return NextResponse.json({ ok: false, error: "Missing voice details." } satisfies AddVoiceResponse, { status: 400 })
  }

  try {
    const res = await fetch(`${ELEVENLABS_BASE}/voices/add/${publicOwnerId}/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ new_name: name.slice(0, 80) }),
    })

    if (!res.ok) {
      const txt = await res.text().catch(() => "")
      let error = "Could not add this voice."
      if (/limit|maximum|reached|quota/i.test(txt)) {
        error = "Your ElevenLabs voice limit is reached. Remove a voice or upgrade your plan, then try again."
      } else if (res.status === 401 || res.status === 403) {
        error = "Your ElevenLabs key cannot add library voices on this plan."
      }
      console.error("[voices/add] ElevenLabs error", res.status, txt.slice(0, 200))
      return NextResponse.json({ ok: false, error } satisfies AddVoiceResponse)
    }

    const data = (await res.json()) as { voice_id?: string }
    return NextResponse.json({ ok: true, voiceId: data.voice_id } satisfies AddVoiceResponse)
  } catch (err) {
    console.error("[voices/add] request failed:", err)
    return NextResponse.json({ ok: false, error: "Add failed. Please try again." } satisfies AddVoiceResponse)
  }
}
