import { NextResponse, NextRequest } from 'next/server'
import connectDb from '@/lib/db'
import ActionItemModel from '@/models/Action.model'
import MeetingModel from '@/models/Meeting.model'
import { WebhookPayload} from '@/types/index'


export async function GET() {

    try {
        await connectDb();

        const meetings = await MeetingModel.find()
            .sort({ createdAt: -1 })
            .select("_id title summary createdAt")
            .lean()

        const meetingsWithCount = await Promise.all(
            meetings.map(async (m) => {
                const count = await ActionItemModel.countDocuments({ meetingId: m._id });
                return { ...m, actionItemCount: count }
            })
        )
        return NextResponse.json(meetingsWithCount,
            { status: 200 }
        );
    }
    catch (error) {
        console.error("[GET /api/meetings]", error);
        return NextResponse.json(
            { error: "Failed to fetch meetings" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDb();

        const body: WebhookPayload = await request.json();

        if (!body) {
            return NextResponse.json(
                {
                    error: "summary is required"
                },
                { status: 400 }
            )

            const meeting = await MeetingModel.create({
                title: body.title || "Untitled Meeting",
                transcript: body.transcript || "",
                summary: body.summary

            });

            const actionItems = await ActionItemModel.insertMany(
                (body.action_items ?? []).map((item) => ({
                    ...item,
                    meetingId: meeting._id,
                    status: "pending",
                }))
            );
            return NextResponse.json(
                { meeting, actionItems },
                { status: 201 }
            );
        }
    }
    catch (error) {
        console.error("[POST /api/meetings]", error);
        return NextResponse.json(
            { error: "Failed to create meeting" },
            { status: 500 }
        );


    }
}