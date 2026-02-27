import { isHoliday as isJapaneseHoliday } from "japanese-holidays"
import type { Client } from "@/types/client"

export function isHoliday(date: Date): boolean {
  return !!isJapaneseHoliday(date)
}

export function isClientHoliday(date: Date, client: Client): boolean {
  if (client.holidays.includes(date.getDay())) return true
  if (client.include_national_holidays && isHoliday(date)) return true
  return false
}

export function getHolidayLabel(date: Date): string | null {
  return isJapaneseHoliday(date) || null
}

/**
 * 指定月の全日付を生成
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const lastDay = new Date(year, month, 0).getDate()
  for (let d = 1; d <= lastDay; d++) {
    days.push(new Date(year, month - 1, d))
  }
  return days
}

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"]

export function getWeekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()]
}
