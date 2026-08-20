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
        
        
    } catch (error) {
        
    }
}