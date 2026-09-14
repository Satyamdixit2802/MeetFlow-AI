import jsPDF from "jspdf"

interface ActionItem {
  task: string
  owner: string
  deadline: string
  status: string
}

interface Meeting {
  title: string
  summary: string
  createdAt: string
  actionItems: ActionItem[]
}

function normalizeStatus(status: string): string {
  return status.toLowerCase()
}

export function generateMeetingPDF(meeting: Meeting): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = 20

  function addText(
    text: string,
    x: number,
    fontSize: number,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [30, 30, 30]
  ) {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", style)
    doc.setTextColor(...color)
    doc.text(text, x, y)
  }

  function addWrappedText(
    text: string,
    fontSize: number,
    color: [number, number, number] = [80, 80, 80]
  ): number {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(text, contentWidth)
    doc.text(lines, margin, y)
    return lines.length * (fontSize * 0.4)
  }

  function checkPageBreak(neededSpace: number) {
    if (y + neededSpace > 270) {
      doc.addPage()
      y = 20
    }
  }

  function drawLine() {
    doc.setDrawColor(220, 220, 220)
    doc.line(margin, y, pageWidth - margin, y)
    y += 6
  }

  doc.setFillColor(124, 106, 247)
  doc.rect(0, 0, pageWidth, 8, "F")
  y = 20

  addText("Meeting Summary", margin, 18, "bold", [30, 30, 30])
  y += 8

  addText(meeting.title, margin, 13, "bold", [60, 60, 60])
  y += 6

  addText(
    `Generated on ${new Date(meeting.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })}`,
    margin,
    9,
    "normal",
    [140, 140, 140]
  )
  y += 10
  drawLine()

  addText("Summary", margin, 12, "bold", [30, 30, 30])
  y += 7

  const summaryHeight = addWrappedText(meeting.summary, 10)
  y += summaryHeight + 10
  drawLine()

  addText(
    `Action Items (${meeting.actionItems.length})`,
    margin,
    12,
    "bold",
    [30, 30, 30]
  )
  y += 8

  if (meeting.actionItems.length === 0) {
    addText("No action items found.", margin, 10, "normal", [140, 140, 140])
    y += 8
  } else {
    meeting.actionItems.forEach((item, index) => {
      checkPageBreak(28)

      if (index % 2 === 0) {
        doc.setFillColor(248, 246, 255)
        doc.rect(margin - 2, y - 5, contentWidth + 4, 22, "F")
      }

      const statusKey = normalizeStatus(item.status)
      const statusColors: Record<string, [number, number, number]> = {
        done: [34, 197, 94],
        "in-progress": [59, 130, 246],
        pending: [234, 179, 8],
      }
      const dotColor = statusColors[statusKey] ?? [140, 140, 140]
      doc.setFillColor(...dotColor)
      doc.circle(margin + 2, y, 2, "F")

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(30, 30, 30)
      const taskLines = doc.splitTextToSize(item.task, contentWidth - 10)
      doc.text(taskLines, margin + 7, y)
      y += taskLines.length * 4 + 2

      doc.setFontSize(8.5)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120, 120, 120)
      doc.text(
        `${item.owner}   •   ${item.deadline}   •   ${statusKey.toUpperCase()}`,
        margin + 7,
        y
      )
      y += 10
    })
  }

  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(180, 180, 180)
    doc.text(
      `AI Meeting Summariser • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: "center" }
    )
  }

  const filename = `${meeting.title.replace(/\s+/g, "-").toLowerCase()}-summary.pdf`
  doc.save(filename)
}
