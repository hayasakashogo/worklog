"use client"

import { useState, useEffect, useCallback } from "react"
import { LogIn, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { floorToFiveMinutes, todayString, calcWorkingHours, formatHoursToHHMM } from "@/lib/time-utils"
import { isClientHoliday } from "@/lib/holidays"

type TimeRecord = {
  id: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off: boolean
}

type PunchStatus = "not_started" | "working" | "finished"

export function PunchButtons({
  client,
  initialRecord,
}: {
  client: Client
  initialRecord: TimeRecord | null
}) {
  const supabase = createClient()
  const todayIsOff = isClientHoliday(new Date(), client)

  const [record, setRecord] = useState<TimeRecord | null>(initialRecord)
  const [restMinutes, setRestMinutes] = useState(
    initialRecord?.rest_minutes ?? client.default_rest_minutes
  )
  const [status, setStatus] = useState<PunchStatus>(() => {
    if (initialRecord?.end_time) return "finished"
    if (initialRecord?.start_time) return "working"
    return "not_started"
  })
  const [loading, setLoading] = useState(false)
  const [isOff, setIsOff] = useState<boolean>(
    initialRecord?.is_off ?? todayIsOff
  )
  const [noteValue, setNoteValue] = useState(initialRecord?.note ?? "")
  const [noteSaving, setNoteSaving] = useState(false)

  const fetchTodayRecord = useCallback(async () => {
    const { data } = await supabase
      .from("time_records")
      .select("*")
      .eq("client_id", client.id)
      .eq("date", todayString())
      .maybeSingle()

    if (data) {
      setRecord(data)
      setRestMinutes(data.rest_minutes)
      setIsOff(data.is_off)
      setNoteValue(data.note ?? "")
      if (data.end_time) {
        setStatus("finished")
      } else if (data.start_time) {
        setStatus("working")
      } else {
        setStatus("not_started")
      }
    } else {
      setRecord(null)
      setRestMinutes(client.default_rest_minutes)
      setIsOff(todayIsOff)
      setNoteValue("")
      setStatus("not_started")
    }
  }, [client.id, client.default_rest_minutes, supabase, todayIsOff])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("time_records_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "time_records",
          filter: `client_id=eq.${client.id}`,
        },
        () => {
          fetchTodayRecord()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [client.id, supabase, fetchTodayRecord])

  const handlePunchIn = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const startTime = floorToFiveMinutes(new Date())

    await supabase.from("time_records").upsert(
      {
        user_id: user.id,
        client_id: client.id,
        date: todayString(),
        start_time: startTime,
        rest_minutes: restMinutes,
      },
      { onConflict: "client_id,date" }
    )

    await fetchTodayRecord()
    setLoading(false)
  }

  const handlePunchOut = async () => {
    if (!record) return
    setLoading(true)

    const endTime = floorToFiveMinutes(new Date())

    await supabase
      .from("time_records")
      .update({ end_time: endTime, rest_minutes: restMinutes })
      .eq("id", record.id)

    await fetchTodayRecord()
    setLoading(false)
  }

  const handleToggleOff = async (checked: boolean) => {
    setIsOff(checked)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from("time_records").upsert(
      {
        user_id: user.id,
        client_id: client.id,
        date: todayString(),
        is_off: checked,
      },
      { onConflict: "client_id,date" }
    )
    fetchTodayRecord()
  }

  const handleSaveNote = async () => {
    if (!record?.id) return
    setNoteSaving(true)
    await supabase.from("time_records").update({ note: noteValue }).eq("id", record.id)
    setNoteSaving(false)
  }

  const workingHours =
    record?.start_time && record?.end_time
      ? calcWorkingHours(record.start_time, record.end_time, record.rest_minutes)
      : null

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-center gap-4">
            <div className="space-y-1">
              <Label>休憩時間</Label>
              <Input
                type="number"
                value={restMinutes}
                onChange={(e) => setRestMinutes(Number(e.target.value) || 0)}
                className="w-28"
                disabled={isOff}
                step={5}
                min={0}
              />
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="h-16 px-8 text-lg"
              onClick={handlePunchIn}
              disabled={loading || status === "working" || status === "finished" || isOff}
            >
              <LogIn className="mr-2 h-5 w-5" />
              出勤
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16 px-8 text-lg"
              onClick={handlePunchOut}
              disabled={loading || status !== "working" || isOff}
            >
              <LogOut className="mr-2 h-5 w-5" />
              退勤
            </Button>
          </div>

          <div className="text-center">
            {status === "not_started" && !isOff && (
              <p className="text-muted-foreground">未出勤</p>
            )}
            {status === "working" && record?.start_time && (
              <p className="text-primary font-semibold">
                出勤中（{record.start_time.slice(0, 5)} 〜）
              </p>
            )}
            {status === "finished" && record?.start_time && record?.end_time && (
              <div className="space-y-1">
                <p className="font-semibold">
                  退勤済み（{record.start_time.slice(0, 5)} 〜 {record.end_time.slice(0, 5)}）
                </p>
                {workingHours !== null && (
                  <p className="text-muted-foreground">
                    稼働時間: {formatHoursToHHMM(workingHours)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="is-off"
              checked={isOff}
              onCheckedChange={(checked) => handleToggleOff(checked === true)}
            />
            <label htmlFor="is-off" className="text-sm cursor-pointer">本日休み</label>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">業務内容・備考</label>
            <Textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={handleSaveNote}
              rows={3}
              placeholder="業務内容や備考を入力"
              disabled={noteSaving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
