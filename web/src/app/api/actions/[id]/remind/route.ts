import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import ActionItem from '@/models/Action.model'
import { requireAuth } from '@/lib/auth'
import { sendEmailReminder } from '@/lib/email'


export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

  const { session, error } = await requireAuth();


  if (error) return error;

  try {
    await dbConnect()
    const { id } = await params

    const action = await ActionItem.findById(id)

    if (!action) {
      return NextResponse.json({ error: "Action item not found" }, { status: 404 })
    }

    if (!action.owner || /^unassigned$/i.test(action.owner.trim())) {
      return NextResponse.json(
        { error: "No owner assigned — cannot send reminder" },
        { status: 400 }
      )
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(action.owner.trim())) {
      return NextResponse.json(
        { error: "Owner must be an email address to send a reminder" },
        { status: 400 }
      )
    }
    await sendEmailReminder(action.owner, action.task, action.deadline)
    return NextResponse.json({ message: `Reminder sent to ${action.owner}` })

  } catch (error) {
    console.error("[POST /api/actions/:id/remind]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send reminder" },
      { status: 500 }
    )
  }
}