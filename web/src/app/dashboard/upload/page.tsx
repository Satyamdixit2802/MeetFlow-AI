import React, {useState} from 'react'
import {useSession} from 'next-auth/react'
import {useRouter} from 'next/navigation'
import {Hourglass,MicAudioLines,Upload,Bot,HardDrive, Circle, CircleCheck, ShieldAlert} from 'lucide-react'

import axios from 'axios'
import {UploadDropzone} from '@/components/UploadDropzone'
import {toast} from '@/components/ui/toast'

type Status = "idle" | "uploading" | "transcribing" | "extracting" | "saving" | "done" | "error"

const STATUS_STEPS : Record<string, {label: string, emoji: React.ReactElement}> = {
    idle : {label : "Ready to process", emoji : <Hourglass size={25}/>},
    uploading : {label : "Uploading file...", emoji : <Upload size={25}/>},
    transcribing : {label : "Transcribing audio...", emoji : <MicAudioLines size={25} />},
    extracting : {label : "Extracting action items...", emoji : <Bot size ={25} />},
    saving : {label : "Saving to database...", emoji : <HardDrive size = {25}/>},
    done : {label : "Done!", emoji : <CircleCheck size={25} />},
    error : {label : "Something went wrong", emoji : <Circle size={25} />}
}

interface ExtractingResult {
    summary : string,
    action_items : {task: string, owner: string, deadline: string}[]
}

export Default function uploadPage() {
    const router = useRouter();
    const {data, session} = useSession();
    
    const [file, setFile] = useState<File | null>(null)
    const [rawText,setRawText] = useState("")
    const [title, setTitle] = useState("")
    const [model,setModel] = useState<"groq" | "openAi">("groq")
    const [status, setStatus] = useState<Status>("idle")
    const [result, setResult] = useState<ExtractingResult | null>(null)
    const [meetingId, setMeetingId] = useState<string | null>(null)

    const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000"

    return (
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">New meeting</h1>
                <p className="text-muted-foreground  text-sm mt-1">
                    Upload an audio recording or paste a transcript 
                </p>
            </div>
            <div className="flex gap-3">
                <input type="text"
                placeholder="Meeting title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)} 
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"/>

                <select 
                value={model}
                onChange={(e) => e.target.value as "groq" || "openAi"}
                 className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none">
                    <option value="groq">Groq</option>
                    <option value="openAi">OpenAi</option>
                 </select>
            </div>
             <UploadDropzone onFileSelect={setFile} selectedFile={file} />
        </div>
    )
}