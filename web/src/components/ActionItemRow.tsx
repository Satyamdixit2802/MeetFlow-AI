"use client"

import {useState} from 'react'
import axios from 'axios'
import {Badge } from '@/components/ui/badge'
import {Button } from '@/components/ui/button'
import {toast, Toast } from '@/components/ui/toast'

type Status = "pending" | "in-progress" | "done"

interface ActionItemRowProps {
  id: string
  task: string
  deadline: string
  owner: string
  status: Status
}

const STATUS_STYLES: Record<Status,string> = {
        "pending":     "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
  "in-progress": "bg-blue-500/10 text-blue-600 border-blue-500/30",
  "done":        "bg-green-500/10 text-green-600 border-green-500/30",
}

const NEXT_STATUS : Record<Status,Status> = {
   "pending" : "in-progress",
   "in-progress": "done",
   "done": "pending"

}

function deadlineColor(deadline: string): string {
  if(deadline === "no deadline") return "text-muted-foreground"
  const d = new Date(deadline)
  if(isNaN(d.getTime()))  return "text-muted-foreground"
   
  const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  if(diff < 0){
     return "text-red-500 font-medium"

  }
  else if(diff < 2){
    return "text-yellow-500 font-medium"
  }
  else {
    return "text-green-600"
  }
}

const ActionItemRow = ({id, task, owner, deadline, status:initialStatus}:ActionItemRowProps) => {

  const [status, setStatus] = useState<status>(initialStatus)
  const [loading, setLoading]  = useState(false)

  async function toggleStatus() {
    const next = NEXT_STATUS[status]
    setLoading(true)
    try {
      await axios.patch(`/api/actions/${id}`, {status : next})
      setStatus(next)
      
    } catch (error) {
      toast.add({type: "destructive", title : "Failed to update status"})
    }finally {
      setLoading(false)
    }

  }

  async function sendReminder(){
    try {
      await axios.post(`/api/actions/${id}/remind`)
      toast.add({title : `Reminder sent to ${owner}`})
    } catch (error) {
      toast.add({title : "Failed to send reminder", type : "destructive"})
    }
  }
  
  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-4 text-sm ">{task}</td>
      <td className="py-3 px-4 text-sm text-muted-foreground">{owner}</td>
      <td className= {`py-3 px-4 text-sm ${deadlineColor(deadline)}`} >{deadline}</td>
      <td className="py-3 px-4">
        <button 
        disabled = {loading}
        onClick={toggleStatus}
        className={`text-xs px-2 py-1 rounded-md border font-medium transition-opacity ${STATUS_STYLES[status]} ${loading ? "opacity-50" : "hover:opacity:80"}`}>
         {status}
        </button>
      </td>
      <td className="py-3 px-4">
        { owner !== "unassigned" && (
          <Button variant='ghost' onClick={sendReminder} className="text-xs h-7"></Button>
        )}

      </td>


    </tr>
  )
}

export default ActionItemRow
