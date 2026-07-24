import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Meeting from "@/models/Meeting.model";
import ActionItem from "@/models/Action.model";

interface Params {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    const meeting = await Meeting.findById(params.id).lean();

    if (!meeting) {
      return NextResponse.json(
        { error: "message not found" },
        { status: 400 }
      );
    }

    const actionItems = await ActionItem.find({ meetingId: params.id })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({ ...meeting, actionItems });
  } catch (error) {
    console.error("[GET /api/meetings/:id]", error);
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await dbConnect();

    const meeting = await Meeting.findByIdAndDelete(params.id);

    if (!meeting) {
      return NextResponse.json(
        { error: "message not found" },
        { status: 400 }
      );
    }

    await ActionItem.deleteMany({ meetingId: params.id });
    return NextResponse.json({ message: "Meeting deleted" });
  } catch (error) {
    console.error("[DELETE /api/meetings/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}