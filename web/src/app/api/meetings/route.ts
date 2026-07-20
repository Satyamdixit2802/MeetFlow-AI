import {NextResponse,NextRequest} from 'next/server'
import connectDb from '@/lib/db'
import ActionItemModel from '@/models/Action.model'
import MeetingModel from '@/models/Meeting.model'
import {IWebhookPayload} from '@/types/index'

export async function GET(){

    try {
        await connectDb();

        const meetings = await MeetingModel.find()
        .sort({createdAt: -1})
        .select("_id title summary createdAt")
        .lean()

        const meetingsWithCount = await Promise.all(
            meetings.map(async (m) => {
                const count = await ActionItemModel.countDocuments({meetingId : m._id});
                return {...m, actionItemCount: count}
            })
        )
         return NextResponse.json(meetingsWithCount,
            {status : 200}
         );
    }
    catch(error){
            console.error("[GET /api/meetings]", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
    }
}