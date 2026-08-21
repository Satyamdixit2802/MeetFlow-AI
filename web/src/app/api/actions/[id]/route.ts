import {NextRequest,NextResponse} from 'next/server'
import dbConnect from '@/lib/db'
import ActionItem from '@/models/Action.model'
import {requireAuth} from '@/lib/auth'


interface Params {
    params  : {id : string}
}

export async function PATCH(request : NextRequest, {params} : Params) {

    const {session, error} = await requireAuth() ;
    if(error) return error

    try {
        await dbConnect()

        const body = await request.json();

        const allowedUpdates : Record<string, unknown> = {}

        if(body.status) allowedUpdates.status = body.status
        if(body.task) allowedUpdates.task = body.task
        if(body.deadline) allowedUpdates.deadline = body.deadline
        if(body.owner) allowedUpdates.owner = body.owner

        const updated = await ActionItem.findByIdAndUpdate(
            params.id,
            allowedUpdates,
            {new : true, runValidators : true}
        )
        if(!updated) {
            return NextResponse.json({ error: "Action item not found" }, { status: 404 })
        }
         return NextResponse.json(updated)

    } catch (error) {
        console.error("[PATCH /api/actions/:id]", error)
    return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
    }
}

export async function DELETE(request : NextRequest, {params} : Params){

    const {session, error} = await requireAuth()

    if(error) return error

    try {
        await dbConnect()

        const deleted = await ActionItem.findByIdAndDelete(params.id)

        if(!deleted){
             return NextResponse.json({ error: "Action item not found" }, { status: 404 })
        }

         return NextResponse.json({ message: "Action item deleted" },{status : 204})
    } catch (error) {
         console.error("[DELETE /api/actions/:id]", error)
    return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
    }
}