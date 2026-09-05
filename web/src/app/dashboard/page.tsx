"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import MeetingCard from '@/components/MeetingCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { MicAudioLines, TriangleAlert } from 'lucide-react'

interface Meeting {
    _id: string
    title: string
    summary: string
    actionItemCount: number
    createdAt: string


}

export default function DashboardPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        axios.get<Meeting[]>("/api/meetings")
            .then((r) => setMeetings(r.data))
            .catch(() => setError("Failed to load meetings"))
            .finally(() => setLoading(false))

    }, [])

    return (
        <div className="max-w-6xl mx-auto px-4 py-10 ">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Meetings
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {meetings?.length} meeting{meetings?.length !== 1 ? 's' : ""} processed
                    </p>
                </div>
                <Link href="/dashboard/upload">
                    <Button>
                        + New meeting
                    </Button>
                </Link>
            </div>

            {
                loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className='h-44 rounded-xl'>

                            </Skeleton>
                        ))}
                    </div>
                )
            }

            {error && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-4xl mb-3"><TriangleAlert size={25} /></p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && meetings?.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-4xl mb-3 "><MicAudioLines size={25} /></p>
                    <p className="font-medium">No meetings yet</p>
                    <p className="text-sm mt-1"> Upload your first recording to get started</p>
                    <Link href="/dashboard/upload" className="mt-4 inline-block">
                        <Button variant={'outline'}>Upload meeting</Button>
                    </Link>



                </div>
            )}
            {!loading && !error && meetings?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {meetings?.map((m) => (
                        <MeetingCard
                            key={m._id}
                            id={m._id}
                            title={m.title}
                            summary={m.summary}
                            actionItemCount={m.actionItemCount}
                            createdAt={m.createdAt} />
                    ))}

                </div>
            )}
        </div>
    );
}
