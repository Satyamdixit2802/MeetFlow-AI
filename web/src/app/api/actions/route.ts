import {NextResponse, NextRequest} from 'next/server'
import dbConnect from '@/lib/db'
import {requireAuth} from '@/lib/auth'
import {sendRemailReminder} from '@/lib/email'
import ActionItem from '@/models/Action.model'


export async function POST(request:NextRequest) {
    
    const {sucess,error} = await requireAuth()

    if (error){
        return error
    }
    try {
        await dbConnect()
        
        const body = await request.json()

        if(!body.task || body.meetingId){
           return NextResponse.json(
        { error: "task and meetingId are required" },
        { status: 400 }
      )
        }

        const actionItem = await ActionItem.create({
            task : body.task,
            owner : body.owner ?? "unasigned",
            deadline : body.deadline ?? "no deadline",
            status : "Pending",
            meetingId : body.meetingId
        })
        

    } catch (error) {
        console.error("[POST /api/actions]", error)
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 })
    }
}