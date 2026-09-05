"use client"
import React, { useState } from 'react'
import axios from 'axios'
import { UploadDropzone } from '@/components/UploadDropzone'
import { useRouter } from 'next/navigation';
import { CalendarDays, Hourglass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserRound } from 'lucide-react'
import { toast } from '@/components/ui/toast';

type Status = "idle" | "uploading" | "transcribing" | "extracting" | "saving" | "done" | "error"


const STATUS_STEPS: Record<string, { label: string; emoji: string }> = {
    idle: { label: "Ready to process", emoji: "⏳" },
    uploading: { label: "Uploading file...", emoji: "📤" },
    transcribing: { label: "Transcribing audio...", emoji: "🎙️" },
    extracting: { label: "Extracting action items...", emoji: "🤖" },
    saving: { label: "Saving to database...", emoji: "💾" },
    done: { label: "Done!", emoji: "✅" },
    error: { label: "Something went wrong", emoji: "❌" },
}
interface ExtractingResult {
    summary: string,
    action_items: { task: string, owner: string, deadline: string }[]
}


export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const router = useRouter()
    const [rawText, setRawText] = useState("")
    const [title, setTitle] = useState("")
    const [model, setModel] = useState<"groq" | "google" | "openai">("groq")
    const [status, setStatus] = useState<Status>("idle")
    const [result, setResult] = useState<ExtractingResult | null>(null)
    const [meetingId, setMeetingId] = useState<string | null>(null)
    const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000"

    async function handleProcess() {
        if (!file && !rawText.trim()) {
            toast.add({ description: "Please upload a file or paste a transcript", type: "warning" })
            return
        }

        try {
            setStatus('uploading')

            const formData = new FormData()
            if (file) formData.append('file', file)

            if (rawText.trim()) formData.append('raw_text', rawText)

            formData.append("model", model)
            formData.append("title", title || "Untitled Meeting")

            setStatus('transcribing')

            const { data: extraction } = await axios.post<ExtractingResult>(
                `${FASTAPI_URL}/api/process`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }

            )

            setStatus('extracting')
            setResult(extraction)

            setStatus('saving')

            await new Promise((r) => setTimeout(r, 1500))

            const { data: meetings } = await axios.get("/api/meetings")

            if (meetings?.[0]?._id) {
                setMeetingId(meetings[0]._id)
            }

            setStatus('done')
            toast.add({ type: "success", description: "Meeting processed successfully" })


        } catch (err) {
            console.error(err)
            setStatus("error")
            toast.add({ type: "destructive", title: "Processing failed", description: "Check that fastapi is running on port 8000" })
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">New meeting</h1>
                <p className="text-sm text-muted-foreground">
                    Upload an audio recording or paste a transcript
                </p>
            </div>
            <div className="flex gap-3">
                <input type="text"
                    placeholder="Meeting title (optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary" />

                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value as "groq" | "google" | "openai")}
                    className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none">
                    <option value="groq">Groq</option>
                    <option value="google">Google</option>
                    <option value="openai">OpenAI</option>
                </select>
            </div>
            <UploadDropzone onFileSelect={setFile} selectedFile={file} />

            <div className="relative">
                <div className="absolute inset-0 flex items-center -z-20">
                    <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase ">
                    <span className="bg-background px-2 text-muted-foreground">or paste transcript</span>
                </div>
            </div>
            <textarea placeholder="paste your meetings tra here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-md rounded-lg border " />

            {status !== 'idle' && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-border ">
                    <span className="text-xl">
                        {status === 'transcribing' || status === 'extracting' || status === 'saving' ?
                            (<span className="animate-spin inline-block"><Hourglass /></span>)
                            : (
                                STATUS_STEPS[status].emoji
                            )}
                    </span>
                    <span className="text-sm font-medium" >
                        {STATUS_STEPS[status].label}
                    </span>
                </div>
            )}
            <Button onClick={handleProcess}
                disabled={status !== "idle" && status !== "error" && status !== "done"}
                className="h-full"
                size="lg"
            >
                {status === "idle" || status === "error" ? "process meeting" : "processing..."}
            </Button>

            {result && (
                <Card>
                    <CardHeader >
                        <CardTitle className="text-base">Summary</CardTitle>

                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="tex-sm text-muted-foreground leading-relaxed">
                            {result.summary}
                        </p>
                        <div >
                            <p className="text-sm font-medium mb-2">
                                Action items ({result.action_items.length})
                            </p>
                            <div className="space-y-2">
                                {result.action_items.map((item, i) => (
                                    <div key={i}
                                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{item.task}</p>
                                            <div className="flex gap-2 mt-1">
                                                <Badge variant={'outline'} className="text-xs" >
                                                    <UserRound size={25} />
                                                    {item.owner}
                                                </Badge>
                                                <Badge variant={'outline'} className="text-xs">
                                                    <CalendarDays size={25} /> {item.deadline}
                                                </Badge>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>

                        {meetingId && (
                            <Button
                                variant={'outline'}
                                className='w-full'
                                onClick={() => router.push(`/meetings/${meetingId}`)}>
                                View full meeting -&gt
                            </Button>
                        )}
                    </CardContent>

                </Card>
            )}

        </div>
    )
}