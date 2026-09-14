"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import MeetingCard from "@/components/MeetingCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MicAudioLines, TriangleAlert } from "lucide-react"

interface Meeting {
  _id: string
  title: string
  summary: string
  actionItemCount: number
  createdAt: string
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [allMeetings, setAllMeetings] = useState<Meeting[]>([])
  const [ownerFilter, setOwnerFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [filterLoading, setFilterLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get<Meeting[]>("/api/meetings")
      .then((r) => {
        setMeetings(r.data)
        setAllMeetings(r.data)
      })
      .catch(() => setError("Failed to load meetings"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!ownerFilter.trim()) {
      setMeetings(allMeetings)
      return
    }

    setFilterLoading(true)
    axios
      .get<Meeting[]>(
        `/api/meetings?owner=${encodeURIComponent(ownerFilter.trim())}`
      )
      .then((r) => setMeetings(r.data))
      .catch(() => setError("Failed to filter meetings"))
      .finally(() => setFilterLoading(false))
  }, [ownerFilter, allMeetings])

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {allMeetings.length} meeting
            {allMeetings.length !== 1 ? "s" : ""} processed
          </p>
        </div>
        <Link href="/dashboard/upload">
          <Button>+ New meeting</Button>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by owner name..."
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="flex-1 max-w-sm h-9 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {ownerFilter && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOwnerFilter("")}
            >
              Clear
            </Button>
            <span className="text-xs text-muted-foreground">
              Showing {meetings.length} of {allMeetings.length} meetings
            </span>
          </>
        )}
      </div>

      {(loading || filterLoading) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">
            <TriangleAlert size={25} />
          </p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !filterLoading && !error && meetings.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-4xl mb-3">
            <MicAudioLines size={25} />
          </p>
          <p className="font-medium">
            {ownerFilter ? "No meetings match this owner" : "No meetings yet"}
          </p>
          <p className="text-sm mt-1">
            {ownerFilter
              ? "Try a different owner name"
              : "Upload your first recording to get started"}
          </p>
          {!ownerFilter && (
            <Link href="/dashboard/upload" className="mt-4 inline-block">
              <Button variant="outline">Upload meeting</Button>
            </Link>
          )}
        </div>
      )}

      {!loading && !filterLoading && !error && meetings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <MeetingCard
              key={m._id}
              id={m._id}
              title={m.title}
              summary={m.summary}
              actionItemCount={m.actionItemCount}
              createdAt={m.createdAt}
            />
          ))}
        </div>
      )}
    </div>
  )
}
