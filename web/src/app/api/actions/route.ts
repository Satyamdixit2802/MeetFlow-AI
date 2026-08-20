import {NextResponse, NextRequest} from 'next/server'
import dbConnect from '@/lib/db'
import {requireAuth} from '@/lib/auth'
import {sendEmailReminder} from '@/lib/email'
import ActionItem from '@/models/Action.model'


export async function POST(request:NextRequest) {
    
    const {session,error} = await requireAuth()

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
            owner : body.owner ?? "unassigned",
            deadline : body.deadline ?? "no deadline",
            status : "Pending",
            meetingId : body.meetingId
        })
        if(body.owner && body.owner !== "unassigned" && body.deadline && body.deadline !== "no deadline"){
            void sendEmailReminder(body.owner, body.task, body.deadline)
        }
         return NextResponse.json(actionItem, { status: 201 })
        

    } catch (error) {
        console.error("[POST /api/actions]", error)
    return NextResponse.json({ error: "Failed to create action item" }, { status: 500 })
    }
}

export async function GET(request : NextRequest){
      const {session, error} = await requireAuth();
      if(error) return error

      try {
        await dbConnect();

        const {searchParams} = new URL(request.url);
        
        const meetingId = searchParams.get("meetingId");

        const filter = meetingId ? {meetingId} : {}
        const actions = await ActionItem.find(filter).sort({createdAt : 1}).lean()

        return NextResponse.json(actions, {
            status : 200
        })
        
      } catch (error) {
         console.error("[GET /api/actions]", error)
    return NextResponse.json({ error: "Failed to fetch actions" }, { status: 500 })
      }

}