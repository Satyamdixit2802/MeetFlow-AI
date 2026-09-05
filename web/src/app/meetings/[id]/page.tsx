"use client"
import ActionItemRow from '@/components/ActionItemRow'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

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
  createdAt: string
  actionItems: ActionItem[]

}

const Meetings = () => {
  const { id } = useParams
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTranscript, setShowTranscript] = useState(false)

  useEffect(() => {
    axios.get<Meeting>(`/api/meetings/${id}`)
      .then((r) => setMeeting(r.data))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])


if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }
  if(!meeting) return null

  const overdueCount = meeting.actionItems.filter((a) => {
    const d = new Date(a.deadline)
    return !isNaN(d.getTime()) || d < new Date() && a.status !== "done"
  }).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-start justify-between gap-4" >
        <div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground hover:text-foreground mb-2 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-semibold">{meeting?.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date(meeting?.createdAt).toLocaleString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })}
            {overdueCount > 0 && (
              <span className="ml-2 text-red-500 font-medium">
                . {overdueCount} overdue
              </span>
            )}
          </p>
        </div>

      </div>

      <Card>
        <CardHeader className="pb-2">
           <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          
        </CardContent>
      </Card>

    </div>
  )
}

export default Meetings
