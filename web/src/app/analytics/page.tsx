"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import StatsCard from "@/components/StatsCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface OwnerStats {
  owner: string
  total: number
  done: number
  pending: number
  inProgress: number
}

interface RecentMeeting {
  _id: string
  title: string
  createdAt: string
}

interface AnalyticsData {
  totalMeetings: number
  totalActions: number
  openActions: number
  overdueActions: number
  doneActions: number
  completionRate: number
  byOwner: OwnerStats[]
  recentMeetings: RecentMeeting[]
  statusBreakdown: { status: string; count: number }[]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    axios
      .get<AnalyticsData>("/api/analytics")
      .then((r) => setData(r.data))
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center text-muted-foreground">
        {error || "No data available"}
      </div>
    )
  }

  const remaining = data.totalActions - data.doneActions

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your meetings and action items
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total meetings"
          value={data.totalMeetings}
          emoji="🎙️"
        />
        <StatsCard
          label="Total actions"
          value={data.totalActions}
          emoji="📋"
        />
        <StatsCard
          label="Open actions"
          value={data.openActions}
          emoji="⏳"
          accent={data.openActions > 0 ? "yellow" : "green"}
          sub={`${data.doneActions} completed`}
        />
        <StatsCard
          label="Overdue"
          value={data.overdueActions}
          emoji="🚨"
          accent={data.overdueActions > 0 ? "red" : "green"}
          sub={
            data.overdueActions > 0 ? "Needs attention" : "All on track"
          }
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Completion rate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{data.completionRate}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${data.completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{data.doneActions} done</span>
            <span>{remaining} remaining</span>
          </div>
        </CardContent>
      </Card>

      {data.byOwner.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By owner</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Owner
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Total
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Done
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    In progress
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Pending
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.byOwner.map((row) => {
                  const pct =
                    row.total > 0 ? Math.round((row.done / row.total) * 100) : 0
                  return (
                    <tr
                      key={row.owner}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 px-3 font-medium">{row.owner}</td>
                      <td className="py-2 px-3">{row.total}</td>
                      <td className="py-2 px-3">
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                          {row.done}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                          {row.inProgress}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                          {row.pending}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {data.recentMeetings.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {data.recentMeetings.map((m) => (
                <li
                  key={m._id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-medium">{m.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
