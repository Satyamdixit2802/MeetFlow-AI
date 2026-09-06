import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Meeting from "@/models/Meeting.model";
import ActionItem from "@/models/Action.model";
import { Types } from "mongoose";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    await dbConnect();

    const meeting = await Meeting.findById(id).lean();

    if (!meeting) {
      return NextResponse.json(
        { error: "message not found" },
        { status: 400 }
      );
    }

    const actionItems = await ActionItem.find({ meetingId: id })
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
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid meeting ID" }, { status: 400 });
    }

    await dbConnect();

    const meeting = await Meeting.findByIdAndDelete(id);

    if (!meeting) {
      return NextResponse.json(
        { error: "message not found" },
        { status: 400 }
      );
    }

    await ActionItem.deleteMany({ meetingId: id });
    return NextResponse.json({ message: "Meeting deleted" });
  } catch (error) {
    console.error("[DELETE /api/meetings/:id]", error);
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    );
  }
}