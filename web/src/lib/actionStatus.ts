export type ActionStatus = "pending" | "in-progress" | "done"

export const ACTION_STATUSES: ActionStatus[] = ["pending", "in-progress", "done"]

export const NEXT_STATUS: Record<ActionStatus, ActionStatus> = {
  pending: "in-progress",
  "in-progress": "done",
  done: "pending",
}

export function normalizeActionStatus(value: unknown): ActionStatus {
  const raw = String(value ?? "pending").toLowerCase().trim()

  if (raw === "done" || raw === "complete" || raw === "completed") return "done"
  if (
    raw === "in-progress" ||
    raw === "in progress" ||
    raw === "inprogress" ||
    raw === "in-prgress" ||
    raw === "in_progress"
  ) {
    return "in-progress"
  }

  return "pending"
}

export function isValidActionStatus(value: unknown): value is ActionStatus {
  return ACTION_STATUSES.includes(value as ActionStatus)
}

export function isRecognizedActionStatus(value: unknown): boolean {
  const raw = String(value ?? "").toLowerCase().trim()
  return [
    "pending",
    "in-progress",
    "in progress",
    "inprogress",
    "in-prgress",
    "in_progress",
    "done",
    "complete",
    "completed",
  ].includes(raw)
}
