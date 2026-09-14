import { NextResponse, NextRequest } from "next/server"
import connectDb from "@/lib/db"
import ActionItemModel from "@/models/Action.model"
import MeetingModel from "@/models/Meeting.model"
import { WebhookPayload } from "@/types/index"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    await connectDb()

    const owner = request.nextUrl.searchParams.get("owner")?.trim()
    const meetingQuery: Record<string, unknown> = {}

    if (owner) {
      const actionItems = await ActionItemModel.find({
        owner: { $regex: owner, $options: "i" },
      })
        .select("meetingId")
        .lean()

      const meetingIds = [
        ...new Set(actionItems.map((item) => item.meetingId.toString())),
      ]

      meetingQuery._id = { $in: meetingIds }
    }

    const meetings = await MeetingModel.find(meetingQuery)
      .sort({ createdAt: -1 })
      .select("_id title summary createdAt")
      .lean()

    const meetingsWithCount = await Promise.all(
      meetings.map(async (m) => {
        const count = await ActionItemModel.countDocuments({ meetingId: m._id })
        return { ...m, actionItemCount: count }
      })
    )

    return NextResponse.json(meetingsWithCount, { status: 200 })
  } catch (err) {
    console.error("[GET /api/meetings]", err)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDb()

    const body: WebhookPayload = await request.json()

    if (!body?.summary) {
      return NextResponse.json(
        { error: "summary is required" },
        { status: 400 }
      )
    }

    const meeting = await MeetingModel.create({
      title: body.title || "Untitled Meeting",
      transcript: body.transcript || "",
      summary: body.summary,
    })

    const actionItems = await ActionItemModel.insertMany(
      (body.action_items ?? []).map((item) => ({
        ...item,
        meetingId: meeting._id,
        status: "pending",
      }))
    )

    return NextResponse.json({ meeting, actionItems }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/meetings]", err)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}
