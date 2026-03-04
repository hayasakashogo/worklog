import type { Client } from "@/types/client"
import { getDaysInMonth, isClientHoliday } from "@/lib/holidays"

export type TimeRecord = {
  date: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off?: boolean
}

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function computeMissingDates(records: TimeRecord[], client: Client, year: number, month: number): string[] {
  const recordMap = new Map(records.map((r) => [r.date, r]))
  const days = getDaysInMonth(year, month)

  return days
    .filter((day) => {
      if (isClientHoliday(day, client)) return false
      const record = recordMap.get(formatDate(day))
      if (record?.is_off) return false
      return !record || record.start_time === null || record.end_time === null
    })
    .map((day) => formatDate(day))
}
