import {getServerSession} from "next-auth"
import {authOptions} from "@/app/api/auth/[...nextauth]/options"

import {NextResponse } from "next/server"
import { error } from "next/dist/build/output/log";

export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if(!session?.user?.id){
        return {
            session : null,
            error : NextResponse.json({
                error : "Unauthorized please signIn:
            },
        {status : 401})
        }
    }
    return {session, error : null}
}