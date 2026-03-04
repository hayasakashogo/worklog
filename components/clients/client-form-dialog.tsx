"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
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

const clientSchema = z.object({
  name: z.string().min(1, "クライアント名を入力してください"),
  min_hours: z.number({ error: "数値を入力してください" }).min(0, "0以上で入力してください"),
  max_hours: z.number({ error: "数値を入力してください" }).min(0, "0以上で入力してください"),
  default_start_time: z.string().min(1, "開始時間を入力してください"),
  default_end_time: z.string().min(1, "終了時間を入力してください"),
  default_rest_minutes: z.number({ error: "数値を入力してください" }).min(0, "0以上で入力してください"),
  holidays: z.array(z.number()),
  include_national_holidays: z.boolean(),
  pdf_filename_template: z.string().min(1, "テンプレートを入力してください"),
}).refine((data) => data.max_hours >= data.min_hours, {
  message: "上限は下限以上の値を入力してください",
  path: ["max_hours"],
})

type FormData = z.infer<typeof clientSchema>

const DEFAULT_VALUES: FormData = {
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
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(clientSchema),
    mode: "onTouched",
    defaultValues: DEFAULT_VALUES,
  })

  const holidays = watch("holidays")
  const includeNationalHolidays = watch("include_national_holidays")

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        const { id: _, ...rest } = editingClient ?? { id: undefined, ...DEFAULT_VALUES }
        reset(rest)
      }, 0)
      return () => clearTimeout(timeout)
    }
  }, [open, editingClient, reset])

  const handleSave = async (data: FormData) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const payload = {
        name: data.name.trim(),
        min_hours: data.min_hours,
        max_hours: data.max_hours,
        default_start_time: data.default_start_time,
        default_end_time: data.default_end_time,
        default_rest_minutes: data.default_rest_minutes,
        holidays: data.holidays,
        include_national_holidays: data.include_national_holidays,
        pdf_filename_template: data.pdf_filename_template,
      }

      if (editingClient?.id) {
        const { error } = await supabase.from("clients").update(payload).eq("id", editingClient.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("clients").insert({ ...payload, user_id: user.id })
        if (error) throw error
      }

      onOpenChange(false)
      onSaved()
    } catch {
      toast.error("クライアントの保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  const toggleHoliday = (day: number) => {
    const current = holidays
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    setValue("holidays", updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editingClient?.id ? "クライアント編集" : "クライアント追加"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>クライアント名</Label>
              <Input
                placeholder="例: 株式会社サンプル"
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>標準工数（下限）</Label>
                <Input
                  type="number"
                  {...register("min_hours", { valueAsNumber: true })}
                />
                {errors.min_hours && <p className="text-sm text-destructive">{errors.min_hours.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>標準工数（上限）</Label>
                <Input
                  type="number"
                  {...register("max_hours", { valueAsNumber: true })}
                />
                {errors.max_hours && <p className="text-sm text-destructive">{errors.max_hours.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>開始時間</Label>
                <Input
                  type="time"
                  {...register("default_start_time")}
                />
              </div>
              <div className="space-y-2">
                <Label>終了時間</Label>
                <Input
                  type="time"
                  {...register("default_end_time")}
                />
              </div>
              <div className="space-y-2">
                <Label>休憩（分）</Label>
                <Input
                  type="number"
                  {...register("default_rest_minutes", { valueAsNumber: true })}
                />
                {errors.default_rest_minutes && <p className="text-sm text-destructive">{errors.default_rest_minutes.message}</p>}
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
                    variant={holidays.includes(day.value) ? "default" : "outline"}
                    onClick={() => toggleHoliday(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={includeNationalHolidays ? "default" : "outline"}
                  onClick={() => setValue("include_national_holidays", !includeNationalHolidays)}
                >
                  祝日
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>PDFファイル名テンプレート</Label>
              <Input
                placeholder="{YYYY}年{MM}月_稼働報告書"
                {...register("pdf_filename_template")}
              />
              {errors.pdf_filename_template && <p className="text-sm text-destructive">{errors.pdf_filename_template.message}</p>}
              <p className="text-xs text-muted-foreground">
                利用可能な変数: {"{YYYY}"} (年), {"{MM}"} (月), {"{CLIENT}"} (クライアント名)
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
