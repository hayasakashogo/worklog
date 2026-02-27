"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { Client } from "@/types/client"
import { ExportPdfButton } from "@/components/records/export-pdf-button"
import { MonthlyTable } from "@/components/records/monthly-table"

type TimeRecord = {
  id?: string
  date: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off: boolean
}

function formatDisplayDate(dateStr: string): string {
  const [, , d] = dateStr.split("-")
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${Number(d)}`
}

export function RecordsPageContent({
  client,
  initialRecords,
  year,
  month,
}: {
  client: Client
  initialRecords: TimeRecord[]
  year: number
  month: number
}) {
  const [highlightDates, setHighlightDates] = useState<Set<string>>(new Set())
  const [missingDisplay, setMissingDisplay] = useState<string[]>([])

  const handleMissingCheck = (missingDates: string[]) => {
    setHighlightDates(new Set(missingDates))
    setMissingDisplay(missingDates.map(formatDisplayDate))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">勤怠一覧</h1>
        <ExportPdfButton
          client={client}
          year={year}
          month={month}
          onMissingCheck={handleMissingCheck}
        />
      </div>

      {missingDisplay.length > 0 && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">勤怠漏れがあります</p>
            <p className="text-xs mt-0.5">{missingDisplay.join("、")}</p>
          </div>
        </div>
      )}

      <MonthlyTable
        client={client}
        initialRecords={initialRecords}
        year={year}
        month={month}
        highlightDates={highlightDates}
      />
    </div>
  )
}
