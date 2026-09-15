import dbconnect from "@/lib/db"
import { NextResponse, NextRequest } from "next/server"
import MeetingModel from "@/models/Meeting.model"
import { requireAuth } from "@/lib/auth"

const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"

const MAX_SUMMARY_CHARS = 800

interface Params {
  params: Promise<{ meetingId: string }>
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim()

  try {
    const { meetingId } = await params
    await dbconnect()

    const meeting = await MeetingModel.findById(meetingId)

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    if (!meeting.summary?.trim()) {
      return NextResponse.json(
        { error: "Meeting has no summary to speak", useBrowserTts: true },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ElevenLabs API key not configured — use browser speech instead",
          useBrowserTts: true,
          text: meeting.summary.slice(0, MAX_SUMMARY_CHARS),
        },
        { status: 503 }
      )
    }

    if (meeting.audioBase64) {
      const audioBuffer = Buffer.from(meeting.audioBase64, "base64")
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Length": audioBuffer.length.toString(),
          "Cache-Control": "private, max-age=31536000, immutable",
          "X-Audio-Source": "cache",
        },
      })
    }

    const textToSpeak = meeting.summary.slice(0, MAX_SUMMARY_CHARS)

    const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if (!elevenLabsResponse.ok) {
      const errText = await elevenLabsResponse.text()
      console.error("[ElevenLabs error]", elevenLabsResponse.status, errText)

      return NextResponse.json(
        {
          error: "ElevenLabs unavailable — use browser speech instead",
          useBrowserTts: true,
          text: textToSpeak,
          detail: errText.slice(0, 200),
        },
        { status: 502 }
      )
    }

    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer()
    const audioBuffer = Buffer.from(audioArrayBuffer)
    const audioBase64 = audioBuffer.toString("base64")

    await MeetingModel.findByIdAndUpdate(meetingId, { audioBase64 })

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "private, max-age=31536000, immutable",
        "X-Audio-Source": "generated",
      },
    })
  } catch (err) {
    console.error("[POST /api/tts/:meetingId]", err)
    return NextResponse.json(
      { error: "Failed to generate audio", useBrowserTts: true },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, context: Params) {
  return POST(request, context)
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const { meetingId } = await params
    await dbconnect()

    await MeetingModel.findByIdAndUpdate(meetingId, { audioBase64: null })
    return NextResponse.json({ message: "Audio cache cleared" })
  } catch (err) {
    console.error("[DELETE /api/tts/:meetingId]", err)
    return NextResponse.json(
      { error: "Failed to clear audio cache" },
      { status: 500 }
    )
  }
}
