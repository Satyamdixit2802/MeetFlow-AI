import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import MeetingModel from "@/models/Meeting.model"
import ActionItemModel from "@/models/Action.model"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const { error } = await requireAuth()
  if (error) return error

  try {
    await dbConnect()

    const now = new Date()

    const [
      totalMeetings,
      totalActions,
      openActions,
      overdueActions,
      doneActions,
      byOwner,
      recentMeetings,
      statusBreakdown,
    ] = await Promise.all([
      MeetingModel.countDocuments(),
      ActionItemModel.countDocuments(),
      ActionItemModel.countDocuments({
        status: { $in: ["pending", "in-progress"] },
      }),
      ActionItemModel.countDocuments({
        status: { $ne: "done" },
        deadline: {
          $nin: ["no deadline", "No Deadline", "no Deadline", ""],
        },
        $expr: {
          $and: [
            { $ne: ["$deadline", null] },
            {
              $lt: [
                {
                  $dateFromString: {
                    dateString: "$deadline",
                    onError: null,
                    onNull: null,
                  },
                },
                now,
              ],
            },
          ],
        },
      }),
      ActionItemModel.countDocuments({ status: "done" }),
      ActionItemModel.aggregate([
        {
          $match: {
            owner: { $not: /^unassigned$/i },
          },
        },
        {
          $group: {
            _id: "$owner",
            total: { $sum: 1 },
            done: {
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] },
            },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            owner: "$_id",
            total: 1,
            done: 1,
            pending: 1,
            inProgress: 1,
          },
        },
      ]),
      MeetingModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title createdAt")
        .lean(),
      ActionItemModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: 1,
          },
        },
      ]),
    ])

    const completionRate =
      totalActions > 0 ? Math.round((doneActions / totalActions) * 100) : 0

    return NextResponse.json({
      totalMeetings,
      totalActions,
      openActions,
      overdueActions,
      doneActions,
      completionRate,
      byOwner,
      recentMeetings,
      statusBreakdown,
    })
  } catch (err) {
    console.error("[GET /api/analytics]", err)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
