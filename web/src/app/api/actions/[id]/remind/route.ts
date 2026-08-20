import {NextRequest, NextResponse} from 'next/server'
import dbConnect from '@/lib/db'
import ActionItem from '@/models/Action.model'
import {requireAuth} from '@/lib/auth'
import {sendEmailReminder} from '@/lib/email'


export async function POST(request : NextRequest, {params} : {params : {id : string}}) {
    
    const {session, error} = await requireAuth();


    if(error) return error;

    try {
        await dbConnect()

        const action = await ActionItem.findById(params.id)

        if(!action) {
             return NextResponse.json({ error: "Action item not found" }, { status: 404 })
        }
        
    if (!action.owner || action.owner === "unassigned") {
      return NextResponse.json(
        { error: "No owner assigned — cannot send reminder" },
        { status: 400 }
      )
    }
     await sendEmailReminder(action.owner, action.task, action.deadline)
      return NextResponse.json({ message: `Reminder sent to ${action.owner}` })

    } catch (error) {
         console.error("[POST /api/actions/:id/remind]", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
    }
}