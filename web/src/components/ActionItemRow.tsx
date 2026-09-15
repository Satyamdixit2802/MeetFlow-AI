"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import {
  type ActionStatus,
  NEXT_STATUS,
  normalizeActionStatus,
} from "@/lib/actionStatus"

interface ActionItemRowProps {
  id: string
  task: string
  deadline: string
  owner: string
  status: string
}

const STATUS_STYLES: Record<ActionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  done: "bg-green-500/10 text-green-600 border-green-500/30",
}

const STATUS_LABELS: Record<ActionStatus, string> = {
  pending: "Pending",
  "in-progress": "In progress",
  done: "Done",
}

function deadlineColor(deadline: string): string {
  const lower = deadline.toLowerCase()
  if (lower === "no deadline") return "text-muted-foreground"

  const d = new Date(deadline)
  if (isNaN(d.getTime())) return "text-muted-foreground"

  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return "text-red-500 font-medium"
  if (diff < 2) return "text-yellow-500 font-medium"
  return "text-green-600"
}

const ActionItemRow = ({
  id,
  task,
  owner,
  deadline,
  status: initialStatus,
}: ActionItemRowProps) => {
  const [status, setStatus] = useState<ActionStatus>(() =>
    normalizeActionStatus(initialStatus)
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setStatus(normalizeActionStatus(initialStatus))
  }, [initialStatus])

  async function toggleStatus() {
    const next = NEXT_STATUS[status]
    setLoading(true)
    try {
      const { data } = await axios.patch<{ status: string }>(`/api/actions/${id}`, {
        status: next,
      })
      setStatus(normalizeActionStatus(data.status))
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined
      toast.add({ type: "error", title: message || "Failed to update status" })
    } finally {
      setLoading(false)
    }
  }

  async function sendReminder() {
    try {
      await axios.post(`/api/actions/${id}/remind`)
      toast.add({ type: "success", title: `Reminder sent to ${owner}` })
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error
        : undefined
      toast.add({ type: "error", title: message || "Failed to send reminder" })
    }
  }

  const isAssigned =
    owner.trim().length > 0 && !/^unassigned$/i.test(owner.trim())

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-4 text-sm">{task}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{owner}</td>
      <td className={`py-3 px-4 text-sm ${deadlineColor(deadline)}`}>{deadline}</td>
      <td className="py-3 px-4">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={toggleStatus}
          className={`text-xs h-7 font-medium ${STATUS_STYLES[status]} ${loading ? "opacity-50" : ""}`}
        >
          {STATUS_LABELS[status]}
        </Button>
      </td>
      <td className="py-3 px-4">
        {isAssigned && (
          <Button variant="ghost" size="sm" onClick={sendReminder} className="text-xs h-7">
            Remind
          </Button>
        )}
      </td>
    </tr>
  )
}

export default ActionItemRow
