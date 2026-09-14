"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AudioPlayerProps {
  meetingId: string
  hasCachedAudio: boolean
}

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error"

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const AudioPlayer = ({ meetingId, hasCachedAudio }: AudioPlayerProps) => {
  const [state, setState] = useState<PlayerState>("idle")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(hasCachedAudio)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [audioUrl])

  async function fetchAndPlay() {
    if (debounceRef.current) return

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
    }, 3000)

    try {
      setState("loading")

      const response = await fetch(`/api/tts/${meetingId}`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? "Failed to generate audio")
      }

      const source = response.headers.get("X-Audio-Source")
      if (source === "generated" || source === "cache") setIsCached(true)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(url)

      const audio = new Audio(url)
      audioRef.current = audio

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })

      audio.addEventListener("ended", () => {
        setState("idle")
        setCurrentTime(0)
      })

      audio.addEventListener("error", () => {
        setState("error")
      })

      await audio.play()
      setState("playing")
    } catch (err) {
      console.error("[AudioPlayer]", err)
      setState("error")
    }
  }

  function togglePlayPause() {
    if (!audioRef.current) return

    if (state === "playing") {
      audioRef.current.pause()
      setState("paused")
    } else if (state === "paused") {
      audioRef.current.play()
      setState("playing")
    }
  }

  if (state === "idle" || state === "error") {
    return (
      <div className="flex flex-col gap-1 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAndPlay}
          className="gap-2 w-fit"
        >
          <span>🔊</span>
          <span>
            {state === "error"
              ? "Retry audio"
              : isCached
                ? "Listen to summary"
                : "Generate spoken summary"}
          </span>
          {isCached && (
            <span className="text-xs text-muted-foreground ml-1">(cached)</span>
          )}
        </Button>
        {state === "error" && (
          <p className="text-xs text-red-500">
            Audio generation failed — check ElevenLabs quota
          </p>
        )}
      </div>
    )
  }

  if (state === "loading") {
    return (
      <Button variant="outline" size="sm" disabled className="gap-2 w-fit mt-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Generating audio...</span>
      </Button>
    )
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/30 w-full max-w-sm mt-4">
      <div className="flex items-center gap-3">
        <Button
          variant="default"
          size="icon"
          onClick={togglePlayPause}
          className="w-8 h-8 rounded-full shrink-0"
        >
          {state === "playing" ? "⏸" : "▶"}
        </Button>
        <div className="flex-1">
          <div className="text-xs font-medium mb-1">Meeting summary</div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatTime(currentTime)}
          {duration > 0 ? ` / ${formatTime(duration)}` : ""}
        </span>
      </div>
    </div>
  )
}

export default AudioPlayer
