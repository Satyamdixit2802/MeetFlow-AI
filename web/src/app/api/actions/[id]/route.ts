import {NextRequest,NextResponse} from 'next/server'
import dbConnect from '@/lib/db'
import ActionItem from '@/models/Action.model'
import {requireAuth} from '@/lib/auth'


interface Params {
    params  : {id : string}
}