import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import ActionItem from "@/models/Action.model"
import { requireAuth } from "@/lib/auth"
import {
    isRecognizedActionStatus,
    normalizeActionStatus,
} from "@/lib/actionStatus"

interface Params {
    params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
    const { error } = await requireAuth()
    if (error) return error

    try {
        await dbConnect()
        const { id } = await params

        const body = await request.json()
        const allowedUpdates: Record<string, unknown> = {}

        if (body.status !== undefined) {
            if (!isRecognizedActionStatus(body.status)) {
                return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
            }
            const normalized = normalizeActionStatus(body.status)
            allowedUpdates.status = normalized
        }

        if (body.task) allowedUpdates.task = body.task
        if (body.deadline) allowedUpdates.deadline = body.deadline
        if (body.owner) allowedUpdates.owner = body.owner

        if (Object.keys(allowedUpdates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
        }

        const updated = await ActionItem.findByIdAndUpdate(id, allowedUpdates, {
            returnDocument: "after",
            runValidators: true,
        })

        if (!updated) {
            return NextResponse.json({ error: "Action item not found" }, { status: 404 })
        }

        return NextResponse.json(updated)
    } catch (err) {
        console.error("[PATCH /api/actions/:id]", err)
        return NextResponse.json({ error: "Failed to update action item" }, { status: 500 })
    }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { error } = await requireAuth()
    if (error) return error

    try {
        await dbConnect()
        const { id } = await params

        const deleted = await ActionItem.findByIdAndDelete(id)

        if (!deleted) {
            return NextResponse.json({ error: "Action item not found" }, { status: 404 })
        }

        return NextResponse.json({ message: "Action item deleted" })
    } catch (err) {
        console.error("[DELETE /api/actions/:id]", err)
        return NextResponse.json({ error: "Failed to delete action item" }, { status: 500 })
    }
}
