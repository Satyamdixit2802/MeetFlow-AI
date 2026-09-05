import Link from 'next/link'
import { Card, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface MeetingCardProps {
    id: string
    title: string
    summary: string
    actionItemCount: number
    createdAt: string

}
function MeetingCard({ id, title, summary, actionItemCount, createdAt }: MeetingCardProps) {
    return (
        <Link href={`meetings/${id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-sm leading-snug line-clamp-1">{title}</h3>
                        <Badge variant="secondary" className='shrink-0 text-xs'>
                            {actionItemCount} actions
                        </Badge>

                    </div>
                    <p className="text-xs text-muted-foreground">
                        {new Date(createdAt).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                        })}
                    </p>
                </CardHeader>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {summary}
                </p>
            </Card>
        </Link>
    )
}

export default MeetingCard