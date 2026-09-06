"use client"

import {useState, useRef, useEffect} from 'react'
import {Button} from '@/components/ui/button'
import { NodejsRequestData } from 'next/dist/server/web/types';

interface AudioPlayerProps {
    meetingId: string
    hasCachedAudio: boolean
}

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error"



const AudioPlayer = ({meetingId, hasCachedAudio}: AudioPlayerProps) => {
     const [state, setState] = useState<PlayerState>('idle')
     const [audioUrl, setAudioUrl] = useState<string | null>(null)
     const [isCached, setIsCached] = useState(hasCachedAudio)
     const [duration, setDuration] = useState(0)
     const [progress, setProgress]  = useState(0)
     const audioRef = useRef<HTMLAudioElement | null>(null) 
     const debounceRef = useRef<NodeJS.Timeout | null>(null) 

  return (
     


    <div>
      
    </div>
  )
}

export default AudioPlayer
