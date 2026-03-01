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
import { cn } from "@/lib/utils"

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
        rest_minutes: restMinutes,
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
    <div className="space-y-4">
      {/* メインカード */}
      <Card className="overflow-hidden shadow-md">
        <div
          className={cn(
            "h-1 w-full bg-gradient-to-r",
            isOff
              ? "from-muted-foreground/40 to-muted-foreground/10"
              : status === "working"
              ? "from-primary to-primary/30"
              : status === "finished"
              ? "from-muted-foreground/40 to-muted-foreground/10"
              : "from-muted-foreground/30 to-muted-foreground/10"
          )}
        />
        <CardContent className="pt-6 pb-6 space-y-6">
          {/* ステータスバッジ */}
          <div className="flex justify-center">
            {isOff ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                本日休み
              </span>
            ) : status === "not_started" ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium bg-muted text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                未出勤
              </span>
            ) : status === "working" && record?.start_time ? (
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-primary/10 text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                出勤中　{record.start_time.slice(0, 5)} 〜
              </span>
            ) : status === "finished" && record?.start_time && record?.end_time ? (
              <div className="text-center space-y-1.5">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold bg-muted text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                  退勤済み　{record.start_time.slice(0, 5)} 〜 {record.end_time.slice(0, 5)}
                </span>
                {workingHours !== null && (
                  <p className="text-sm text-muted-foreground">
                    稼働時間{" "}
                    <span className="font-bold text-base text-foreground">{formatHoursToHHMM(workingHours)}</span>
                  </p>
                )}
              </div>
            ) : null}
          </div>

          {/* 打刻ボタン */}
          <div className="flex justify-center gap-3">
            <Button
              size="lg"
              className="h-14 px-10 text-base font-semibold rounded-xl shadow-sm"
              onClick={handlePunchIn}
              disabled={loading || status === "working" || status === "finished" || isOff}
            >
              <LogIn className="mr-2 h-5 w-5" />
              出勤
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 text-base font-semibold rounded-xl"
              onClick={handlePunchOut}
              disabled={loading || status !== "working" || isOff}
            >
              <LogOut className="mr-2 h-5 w-5" />
              退勤
            </Button>
          </div>

          {/* フッター: 休憩時間 + 本日休み */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground whitespace-nowrap">休憩時間</Label>
              <Input
                type="number"
                value={restMinutes}
                onChange={(e) => setRestMinutes(Number(e.target.value) || 0)}
                className="w-20 h-8 text-sm"
                disabled={isOff}
                step={5}
                min={0}
              />
              <span className="text-xs text-muted-foreground">分</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-off"
                checked={isOff}
                onCheckedChange={(checked) => handleToggleOff(checked === true)}
              />
              <label htmlFor="is-off" className="text-xs text-muted-foreground cursor-pointer">
                本日休み
              </label>
            </div>
          </div>

          {/* 業務内容・備考 */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs text-muted-foreground">業務内容・備考</label>
            <Textarea
              value={noteValue}
              onChange={(e) => setNoteValue(e.target.value)}
              onBlur={handleSaveNote}
              rows={3}
              placeholder="業務内容や備考を入力"
              disabled={noteSaving}
              className="resize-none text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
