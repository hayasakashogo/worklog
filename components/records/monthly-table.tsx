"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getDaysInMonth, getWeekdayLabel, isHoliday, getHolidayLabel, isClientHoliday } from "@/lib/holidays"
import { calcWorkingHours, formatHoursToHHMM, timeToMinutes } from "@/lib/time-utils"

type TimeRecord = {
  id?: string
  date: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off: boolean
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function MonthlyTable({
  client,
  initialRecords,
  year,
  month,
  highlightDates,
}: {
  client: Client
  initialRecords: TimeRecord[]
  year: number
  month: number
  highlightDates?: Set<string>
}) {
  const router = useRouter()
  const supabase = createClient()

  const [records, setRecords] = useState<Map<string, TimeRecord>>(() => {
    const map = new Map<string, TimeRecord>()
    initialRecords.forEach((r) => map.set(r.date, r))
    return map
  })
  const [editingCell, setEditingCell] = useState<{ date: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")

  const fetchRecords = useCallback(async () => {
    const monthStr = month.toString().padStart(2, "0")
    const startDate = `${year}-${monthStr}-01`
    const endDate = `${year}-${monthStr}-${new Date(year, month, 0).getDate()}`

    const { data } = await supabase
      .from("time_records")
      .select("*")
      .eq("client_id", client.id)
      .gte("date", startDate)
      .lte("date", endDate)

    const map = new Map<string, TimeRecord>()
    data?.forEach((r) => map.set(r.date, r))
    setRecords(map)
  }, [client.id, year, month, supabase])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("attendance_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_records",
          filter: `client_id=eq.${client.id}`,
        },
        () => fetchRecords()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [client.id, supabase, fetchRecords])

  const prevMonth = () => {
    let newYear = year
    let newMonth = month
    if (month === 1) {
      newYear = year - 1
      newMonth = 12
    } else {
      newMonth = month - 1
    }
    router.push(`/dashboard/${client.id}/records/${newYear}-${newMonth.toString().padStart(2, "0")}`)
  }

  const nextMonth = () => {
    let newYear = year
    let newMonth = month
    if (month === 12) {
      newYear = year + 1
      newMonth = 1
    } else {
      newMonth = month + 1
    }
    router.push(`/dashboard/${client.id}/records/${newYear}-${newMonth.toString().padStart(2, "0")}`)
  }

  const days = getDaysInMonth(year, month)

  const saveEdit = async (dateStr: string, field: string, value: string) => {
    const existing = records.get(dateStr)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const updateData: Record<string, unknown> = {}

    if (field === "start_time" || field === "end_time") {
      updateData[field] = value || null
    } else if (field === "rest_minutes") {
      updateData[field] = value ? Number(value) : 0
    } else if (field === "note") {
      updateData[field] = value
    }

    if (existing?.id) {
      await supabase.from("time_records").update(updateData).eq("id", existing.id)
    } else {
      const dateObj = new Date(dateStr)
      const defaultIsOff = isClientHoliday(dateObj, client)
      await supabase.from("time_records").insert({
        user_id: user.id,
        client_id: client.id,
        date: dateStr,
        start_time: null,
        end_time: null,
        rest_minutes: client.default_rest_minutes,
        note: "",
        is_off: defaultIsOff,
        ...updateData,
      })
    }

    setEditingCell(null)
    fetchRecords()
  }

  const saveIsOff = async (date: string, checked: boolean) => {
    const existing = records.get(date)
    if (existing?.id) {
      await supabase.from("time_records")
        .update({ is_off: checked })
        .eq("id", existing.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from("time_records").insert({
        user_id: user!.id,
        client_id: client.id,
        date,
        is_off: checked,
        start_time: null,
        end_time: null,
        rest_minutes: client.default_rest_minutes,
        note: ""
      })
    }
    fetchRecords()
  }

  const handleCellClick = (dateStr: string, field: string, currentValue: string) => {
    setEditingCell({ date: dateStr, field })
    setEditValue(currentValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent, dateStr: string, field: string) => {
    if (e.key === "Enter" && field !== "note") {
      saveEdit(dateStr, field, editValue)
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

  const renderEditableCell = (dateStr: string, field: string, value: string, type = "text", disabled = false, missing = false) => {
    const isEditing = editingCell?.date === dateStr && editingCell?.field === field

    if (disabled) {
      return <span className="block px-1 py-0.5 min-h-[1.5rem] text-muted-foreground/30">&nbsp;</span>
    }

    if (isEditing) {
      if (field === "note") {
        return (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => saveEdit(dateStr, field, editValue)}
            onKeyDown={(e) => handleKeyDown(e, dateStr, field)}
            rows={2}
            className="h-auto text-sm min-w-[120px]"
            autoFocus
          />
        )
      }
      return (
        <Input
          type={type === "time" ? "time" : type === "number" ? "number" : "text"}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => saveEdit(dateStr, field, editValue)}
          onKeyDown={(e) => handleKeyDown(e, dateStr, field)}
          className={`h-7 w-full min-w-0 px-1 text-xs${missing ? " ring-1 ring-destructive border-destructive" : ""}`}
          autoFocus
          step={type === "time" ? 300 : type === "number" ? 5 : undefined}
          min={type === "number" ? 0 : undefined}
        />
      )
    }

    return (
      <span
        className={`block cursor-pointer rounded px-1 py-0.5 hover:bg-accent min-h-[1.5rem]${missing ? " ring-1 ring-destructive" : ""}`}
        onClick={() => handleCellClick(dateStr, field, value)}
      >
        {value || "\u00A0"}
      </span>
    )
  }

  // 月合計稼働時間
  let totalHours = 0
  records.forEach((r) => {
    if (r.is_off) return
    const h = calcWorkingHours(
      r.start_time?.slice(0, 5) ?? null,
      r.end_time?.slice(0, 5) ?? null,
      r.rest_minutes
    )
    if (h) totalHours += h
  })

  // 推定稼働時間の計算
  let estimatedHours: number | null = null
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month
  const defaultWorkMinutes =
    timeToMinutes(client.default_end_time) -
    timeToMinutes(client.default_start_time) -
    client.default_rest_minutes
  const defaultWorkHours = defaultWorkMinutes / 60

  if (isCurrentMonth) {
    let remainingWorkDays = 0
    days.forEach((day) => {
      if (day.getDate() <= today.getDate()) return
      if (isClientHoliday(day, client)) return
      remainingWorkDays++
    })
    estimatedHours = totalHours + remainingWorkDays * defaultWorkHours
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle>
              {year}年{month}月
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm mb-4">
            <div>
              合計稼働時間:{" "}
              <span className="font-bold">{formatHoursToHHMM(totalHours)}</span>
            </div>
            <div>
              標準工数: {client.min_hours}〜{client.max_hours}h
            </div>
            {estimatedHours !== null && (
              <div>
                推定稼働時間:{" "}
                <span className="font-bold">{formatHoursToHHMM(estimatedHours)}</span>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">日</TableHead>
                  <TableHead className="w-12">曜</TableHead>
                  <TableHead className="w-12">休み</TableHead>
                  <TableHead className="w-24">開始</TableHead>
                  <TableHead className="w-24">終了</TableHead>
                  <TableHead className="w-20">休憩</TableHead>
                  <TableHead className="w-20">稼働</TableHead>
                  <TableHead>業務内容・備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {days.map((day) => {
                  const dateStr = formatDate(day)
                  const dow = day.getDay()
                  const isNationalHoliday = client.include_national_holidays && isHoliday(day)
                  const isClientHolidayDay = isClientHoliday(day, client)
                  const holidayName = getHolidayLabel(day)
                  const record = records.get(dateStr)

                  const recordIsOff = record?.is_off ?? isClientHolidayDay
                  const isOffRow = recordIsOff

                  const startTime = record?.start_time?.slice(0, 5) ?? ""
                  const endTime = record?.end_time?.slice(0, 5) ?? ""
                  const restMin = record?.rest_minutes ?? client.default_rest_minutes
                  const note = record?.note ?? ""
                  const workHours = isOffRow ? null : calcWorkingHours(
                    startTime || null,
                    endTime || null,
                    restMin
                  )

                  const isMissing = highlightDates?.has(dateStr) ?? false

                  return (
                    <TableRow
                      key={dateStr}
                      className={isOffRow ? "bg-muted/50 text-muted-foreground" : undefined}
                    >
                      <TableCell className="text-xs">{day.getDate()}</TableCell>
                      <TableCell
                        className={`text-xs ${
                          dow === 0 || isNationalHoliday
                            ? "text-destructive"
                            : dow === 6
                              ? "text-blue-500"
                              : ""
                        }`}
                      >
                        {getWeekdayLabel(day)}
                        {holidayName && (
                          <span className="ml-1 text-[10px]">({holidayName})</span>
                        )}
                      </TableCell>
                      <TableCell className="p-1">
                        <Checkbox
                          checked={isOffRow}
                          onCheckedChange={(checked) => saveIsOff(dateStr, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="p-1">
                        {renderEditableCell(dateStr, "start_time", startTime, "time", isOffRow, isMissing && !record?.start_time)}
                      </TableCell>
                      <TableCell className="p-1">
                        {renderEditableCell(dateStr, "end_time", endTime, "time", isOffRow, isMissing && !record?.end_time)}
                      </TableCell>
                      <TableCell className="p-1">
                        {renderEditableCell(dateStr, "rest_minutes", record ? String(restMin) : "", "number", isOffRow)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {workHours !== null ? formatHoursToHHMM(workHours) : ""}
                      </TableCell>
                      <TableCell className="p-1">
                        {renderEditableCell(dateStr, "note", note, "text", false)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
