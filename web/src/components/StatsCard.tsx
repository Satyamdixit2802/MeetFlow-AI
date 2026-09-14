interface StatsCardProps {
  label: string
  value: number | string
  emoji: string
  accent?: "default" | "red" | "green" | "yellow" | "blue"
  sub?: string
}

const ACCENT_STYLES = {
  default: "text-foreground",
  red: "text-red-500",
  green: "text-green-500",
  yellow: "text-yellow-500",
  blue: "text-blue-500",
}

const StatsCard = ({
  label,
  value,
  emoji,
  accent = "default",
  sub,
}: StatsCardProps) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <span className="text-xl">{emoji}</span>
      </div>
      <div className={`text-3xl font-bold ${ACCENT_STYLES[accent]}`}>{value}</div>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  )
}

export default StatsCard
