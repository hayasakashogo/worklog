"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type ClientData = {
  id?: string
  name: string
  min_hours: number
  max_hours: number
  default_start_time: string
  default_end_time: string
  default_rest_minutes: number
  holidays: number[]
  include_national_holidays: boolean
  pdf_filename_template: string
}

const WEEKDAYS = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
]

const DEFAULT_CLIENT: ClientData = {
  name: "",
  min_hours: 140,
  max_hours: 180,
  default_start_time: "09:00",
  default_end_time: "18:00",
  default_rest_minutes: 60,
  holidays: [0, 6],
  include_national_holidays: true,
  pdf_filename_template: "{YYYY}年{MM}月_稼働報告書",
}

export function ClientFormDialog({
  open,
  onOpenChange,
  editingClient,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingClient: ClientData | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<ClientData>(DEFAULT_CLIENT)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (open) {
      setForm(editingClient ?? DEFAULT_CLIENT)
    }
  }, [open, editingClient])

  const handleSave = async () => {
    if (!form.name.trim()) return
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const payload = {
      name: form.name.trim(),
      min_hours: form.min_hours,
      max_hours: form.max_hours,
      default_start_time: form.default_start_time,
      default_end_time: form.default_end_time,
      default_rest_minutes: form.default_rest_minutes,
      holidays: form.holidays,
      include_national_holidays: form.include_national_holidays,
      pdf_filename_template: form.pdf_filename_template,
    }

    if (form.id) {
      await supabase.from("clients").update(payload).eq("id", form.id)
    } else {
      await supabase.from("clients").insert({ ...payload, user_id: user.id })
    }

    setLoading(false)
    onOpenChange(false)
    onSaved()
  }

  const toggleHoliday = (day: number) => {
    setForm((prev) => ({
      ...prev,
      holidays: prev.holidays.includes(day)
        ? prev.holidays.filter((d) => d !== day)
        : [...prev.holidays, day].sort(),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "クライアント編集" : "クライアント追加"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>クライアント名</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例: 株式会社サンプル"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>標準工数（下限）</Label>
              <Input
                type="number"
                value={form.min_hours}
                onChange={(e) => setForm({ ...form, min_hours: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>標準工数（上限）</Label>
              <Input
                type="number"
                value={form.max_hours}
                onChange={(e) => setForm({ ...form, max_hours: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>開始時間</Label>
              <Input
                type="time"
                value={form.default_start_time}
                onChange={(e) => setForm({ ...form, default_start_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>終了時間</Label>
              <Input
                type="time"
                value={form.default_end_time}
                onChange={(e) => setForm({ ...form, default_end_time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>休憩（分）</Label>
              <Input
                type="number"
                value={form.default_rest_minutes}
                onChange={(e) => setForm({ ...form, default_rest_minutes: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>休み設定</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  size="sm"
                  variant={form.holidays.includes(day.value) ? "default" : "outline"}
                  onClick={() => toggleHoliday(day.value)}
                >
                  {day.label}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant={form.include_national_holidays ? "default" : "outline"}
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    include_national_holidays: !prev.include_national_holidays,
                  }))
                }
              >
                祝日
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>PDFファイル名テンプレート</Label>
            <Input
              value={form.pdf_filename_template}
              onChange={(e) => setForm({ ...form, pdf_filename_template: e.target.value })}
              placeholder="{YYYY}年{MM}月_稼働報告書"
            />
            <p className="text-xs text-muted-foreground">
              利用可能な変数: {"{YYYY}"} (年), {"{MM}"} (月), {"{CLIENT}"} (クライアント名)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={loading || !form.name.trim()}>
            {loading ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
