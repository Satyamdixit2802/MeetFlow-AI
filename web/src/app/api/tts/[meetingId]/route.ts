import  dbconnect  from '@/lib/db'
import {NextResponse, NextRequest} from 'next/server'
import MeetingModel from '@/models/Meeting.model'
import {requireAuth} from '@/lib/auth'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY!
const ELEVENLABS_VOICE_ID =
  process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"

  const MAX_SUMMARY_CHARS = 800

  interface Params {
    params : {meetingId : string}
  }

  export async function POsT(request: NextRequest, {params} : Params){

            const {session,error} = await requireAuth()

            if(error) return error

            try {
                await dbconnect()

                const meeting = await MeetingModel.findById(params.meetingId)

                if(!meeting) {
                    return NextResponse.json({
                        error : "Meeting not found"
                    },
                {
                    status: 404
                })
                }

                if(!meeting.summary){
                    return NextResponse.json({
                        error: "Meeting has no summary to speak"
                    },
                {status : 400})
                }

                if(meeting.audioBase64) {
                    const audioBuffer = Buffer.from(meeting.audioBase64,"base64")
                    return NextResponse.json(audioBuffer,{
                        status : 200,
                        headers : {
                            "Content-Type": "audio/mpeg",
                            "Content-Length": audioBuffer.length.toString(),
                            "X-Audio-Source": "cache", 

                        }
                    })
                }
                const textToSpeak = meeting.summary.slice(0,MAX_SUMMARY_CHARS)

                 const elevenLabsResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: textToSpeak,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    )

    if(!elevenLabsResponse.ok){
        const errText = await elevenLabsResponse.text()
        console.error("[ElevenLabs error]",errText)


        return NextResponse.json({
            error : "ElevenLabs API failed - check your API key and quota"
        },
    {status: 502})
    }

    const audioArrayBuffer = await elevenLabsResponse.arrayBuffer()
     const audioBuffer = Buffer.from(audioArrayBuffer)
     const audioBase64 = audioBuffer.toString("base64")

     await MeetingModel.findByIdAndUpdate(params.meetingId,{audioBase64})

        return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "X-Audio-Source": "generated",
      },
    })
                
            } catch (err) {
                console.error("[POST /api/tts/:meetingId]", err)
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    )
                
            }

  }

  export async function DELETE(request : NextRequest, {params}: Params) {
    
    const {session, error} = await requireAuth()

    if(error) return error

    try {
        await dbconnect()

        await MeetingModel.findByIdAndUpdate(params.meetingId,{audioBase64 : null})
        NextResponse.json({message: "Audio cached cleared"})
        
    } catch (err) {
        console.error("[DELETE /api/tts/:meetingId",err)
        return NextResponse.json(
            {error: "Failed to clear audio cache"},
            {status: 500}

        )
    }

    
  }
