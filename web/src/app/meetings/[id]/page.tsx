"use client"

import ActionItemRow from "@/components/ActionItemRow"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import AudioPlayer from "@/components/AudioPlayer"
import { generateMeetingPDF } from "@/lib/generatePDF"

type Status = "pending" | "in-progress" | "done"

interface ActionItem {
  _id: string
  task: string
  owner: string
  deadline: string
  status: Status
}

interface Meeting {
  _id: string
  title: string
  summary: string
  transcript: string
  audioBase64?: string
  createdAt: string
  actionItems: ActionItem[]
}

const Meetings = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  useEffect(() => {
    axios
      .get<Meeting>(`/api/meetings/${id}`)
      .then((r) => setMeeting(r.data))
      .catch(() => router.push("/dashboard"))
      .finally(() => setLoading(false))
  }, [id, router])

  function handleExportPDF() {
    if (!meeting) return
    setPdfLoading(true)
    try {
      generateMeetingPDF({
        title: meeting.title,
        summary: meeting.summary,
        createdAt: meeting.createdAt,
        actionItems: meeting.actionItems,
      })
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if (!meeting) return null

  const overdueCount = meeting.actionItems.filter((a) => {
    const d = new Date(a.deadline)
    return !isNaN(d.getTime()) && d < new Date() && a.status !== "done"
  }).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold">{meeting.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(meeting.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                · {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          disabled={pdfLoading}
          className="gap-2 shrink-0"
        >
          <span>📄</span>
          {pdfLoading ? "Exporting..." : "Export PDF"}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {meeting.summary}
          </p>
          <AudioPlayer
            meetingId={meeting._id}
            hasCachedAudio={!!meeting.audioBase64}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs"
            onClick={() => setShowTranscript(!showTranscript)}
          >
            {showTranscript ? "Hide transcript" : "Show transcript"}
          </Button>
          {showTranscript && (
            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
              {meeting.transcript || "No transcript available"}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Action items ({meeting.actionItems.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pb-0">
          {meeting.actionItems.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">
              No action items found for this meeting.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">
                      Task
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">
                      Owner
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">
                      Deadline
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left py-2 px-4 text-xs font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {meeting.actionItems.map((item) => (
                    <ActionItemRow
                      key={item._id}
                      id={item._id}
                      task={item.task}
                      owner={item.owner}
                      deadline={item.deadline}
                      status={item.status}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Meetings
