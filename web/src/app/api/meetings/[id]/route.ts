import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Meeting from "@/models/Meeting.model";
import ActionItem from "@/models/Action.model";


interface Params {
    id : string
}

export async function GET(request: NextRequest, {params}:Params) {
    
    try {
        await dbConnect();

        const meeting = await Meeting.findById(params.id).lean()

        if(!meeting){
            return NextResponse.json(
                {
                    error : "message not found"
                },
                {
                    status : 400
                }
            )
        }

        
    }
}