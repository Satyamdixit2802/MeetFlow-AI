"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface AudioPlayerProps {
  meetingId: string
  summaryText: string
  hasCachedAudio: boolean
}

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error"
type AudioMode = "elevenlabs" | "browser" | null

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

function speakWithBrowser(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      reject(new Error("Browser speech not supported"))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text.slice(0, 800))
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onend = () => resolve()
    utterance.onerror = () => reject(new Error("Browser speech failed"))

    window.speechSynthesis.speak(utterance)
  })
}

const AudioPlayer = ({
  meetingId,
  summaryText,
  hasCachedAudio,
}: AudioPlayerProps) => {
  const [state, setState] = useState<PlayerState>("idle")
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isCached, setIsCached] = useState(hasCachedAudio)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [mode, setMode] = useState<AudioMode>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const browserSpeakingRef = useRef(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    audio.src = audioUrl
    audio.load()

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handlePlay = () => setState("playing")
    const handlePause = () => {
      if (!audio.ended) setState("paused")
    }
    const handleEnded = () => {
      setState("idle")
      setCurrentTime(0)
    }
    const handleError = () => {
      setState("error")
      setStatusMessage("Audio playback failed")
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("play", handlePlay)
    audio.addEventListener("pause", handlePause)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    void audio.play().catch(() => {
      setState("paused")
      setStatusMessage("Press play to start the audio")
    })

    return () => {
      audio.pause()
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("play", handlePlay)
      audio.removeEventListener("pause", handlePause)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [audioUrl])

  useEffect(() => () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    window.speechSynthesis?.cancel()
  }, [audioUrl])

  async function playBrowserSpeech(text: string) {
    setMode("browser")
    setStatusMessage("Using browser voice (ElevenLabs unavailable)")
    setState("playing")
    browserSpeakingRef.current = true

    try {
      await speakWithBrowser(text)
      if (browserSpeakingRef.current) {
        setState("idle")
        setCurrentTime(0)
      }
    } catch {
      setState("error")
      setStatusMessage("Browser speech is not supported in this browser")
    } finally {
      browserSpeakingRef.current = false
    }
  }

  async function fetchAndPlay() {
    if (debounceRef.current) return

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null
    }, 3000)

    if (!summaryText.trim()) {
      setState("error")
      setStatusMessage("No summary text available to speak")
      return
    }

    try {
      setState("paused")
      setStatusMessage(null)

      const response = await fetch(`/api/tts/${meetingId}`, {
        method: "GET",
        cache: "force-cache",
      })

      if (!response.ok) {
        let useBrowser = false
        let text = summaryText

        try {
          const data = await response.json()
          useBrowser = Boolean(data.useBrowserTts)
          if (typeof data.text === "string") text = data.text
        } catch {
          useBrowser = response.status === 502 || response.status === 503
        }

        if (useBrowser) {
          await playBrowserSpeech(text)
          return
        }

        throw new Error("Failed to generate audio")
      }

      const source = response.headers.get("X-Audio-Source")
      if (source === "generated" || source === "cache") setIsCached(true)

      setMode("elevenlabs")
      setStatusMessage(
        source === "cache" ? "Playing cached ElevenLabs audio" : "Playing ElevenLabs audio"
      )

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)

      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(url)

      setState("loading")
      setCurrentTime(0)
      setDuration(0)
    } catch (err) {
      console.error("[AudioPlayer]", err)
      await playBrowserSpeech(summaryText)
    }
  }

  function stopBrowserSpeech() {
    browserSpeakingRef.current = false
    window.speechSynthesis?.cancel()
  }

  function togglePlayPause() {
    if (mode === "browser") {
      if (state === "playing") {
        stopBrowserSpeech()
        setState("paused")
      } else if (state === "paused") {
        void playBrowserSpeech(summaryText)
      }
      return
    }

    if (!audioRef.current) return

    if (state === "playing") {
      audioRef.current.pause()
      setState("paused")
    } else if (state === "paused") {
      audioRef.current.play()
      setState("playing")
    }
  }

  function handleStop() {
    if (mode === "browser") {
      stopBrowserSpeech()
      setState("idle")
      setCurrentTime(0)
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setState("idle")
    setCurrentTime(0)
  }

  if (state === "idle" || state === "error") {
    return (
      <div className="flex flex-col gap-1 mt-4">
        <div className="flex flex-wrap items-center gap-2">
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
                  : "Speak summary"}
            </span>
            {isCached && (
              <span className="text-xs text-muted-foreground ml-1">(cached)</span>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => playBrowserSpeech(summaryText)}
            className="text-xs"
          >
            Browser voice
          </Button>
        </div>
        {state === "error" && statusMessage && (
          <p className="text-xs text-red-500">{statusMessage}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Uses ElevenLabs when configured; otherwise falls back to your browser voice.
        </p>
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

  const progress =
    mode === "browser"
      ? state === "playing"
        ? 50
        : 0
      : duration > 0
        ? (currentTime / duration) * 100
        : 0

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg border border-border bg-muted/30 w-full max-w-sm mt-4">
      {mode === "elevenlabs" && audioUrl && (
        <audio
          ref={audioRef}
          controls
          preload="metadata"
          className="w-full"
          aria-label="Meeting summary audio"
        />
      )}
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
          <div className="text-xs font-medium mb-1">
            {mode === "browser" ? "Browser voice" : "ElevenLabs audio"}
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {mode === "elevenlabs" && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(currentTime)}
            {duration > 0 ? ` / ${formatTime(duration)}` : ""}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={handleStop} className="text-xs h-7">
          Stop
        </Button>
      </div>
      {statusMessage && (
        <p className="text-xs text-muted-foreground">{statusMessage}</p>
      )}
    </div>
  )
}

export default AudioPlayer
