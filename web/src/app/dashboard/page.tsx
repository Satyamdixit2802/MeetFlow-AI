"use client"

import {useEffect, useState} from 'react'
import Link from 'next/link'
import axios from 'axios'
import {MeetingCard} from '@/components/MeetingCard'
import {Skeleton} from '@/components/ui/skeleton'
import {Button} from '@/components/ui/button'

interface Meeting {
    _id: string
    title: string
    summary: string
    actionItemCount: number
    createdAt: string


}

export default function DashboardPage () {
const [meetings, setMeetings] = useState<Meeting[]>()
const [loading, setLoading] = useState()
const [error, setErro] = useState()

    return (
       <div className="pl">
           hi
       </div>
    );
}
