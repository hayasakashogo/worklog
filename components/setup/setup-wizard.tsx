"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const WEEKDAYS = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
]

const step1Schema = z.object({
  fullName: z.string().min(1, "氏名を入力してください"),
})

const step2Schema = z.object({
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

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

export function SetupWizard({ initialFullName }: { initialFullName: string }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onTouched",
    defaultValues: { fullName: initialFullName },
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      min_hours: 140,
      max_hours: 180,
      default_start_time: "09:00",
      default_end_time: "18:00",
      default_rest_minutes: 60,
      holidays: [0, 6],
      include_national_holidays: true,
      pdf_filename_template: "{YYYY}年{MM}月_稼働報告書",
    },
  })

  const holidays = form2.watch("holidays")
  const includeNationalHolidays = form2.watch("include_national_holidays")

  const handleStep1 = async (data: Step1Data) => {
    setLoading(true)
    setServerError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setServerError("セッションが切れました。再度ログインしてください。")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: data.fullName.trim() })
      .eq("id", user.id)

    if (error) {
      setServerError("氏名の保存に失敗しました。")
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async (data: Step2Data) => {
    setLoading(true)
    setServerError("")

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setServerError("セッションが切れました。再度ログインしてください。")
      setLoading(false)
      return
    }

    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        name: data.name.trim(),
        min_hours: data.min_hours,
        max_hours: data.max_hours,
        default_start_time: data.default_start_time,
        default_end_time: data.default_end_time,
        default_rest_minutes: data.default_rest_minutes,
        holidays: data.holidays,
        include_national_holidays: data.include_national_holidays,
        pdf_filename_template: data.pdf_filename_template,
        user_id: user.id,
      })
      .select("id")
      .single()

    if (error || !newClient) {
      setServerError("クライアントの保存に失敗しました。")
      setLoading(false)
      return
    }

    router.push(`/dashboard/${newClient.id}`)
    router.refresh()
  }

  const toggleHoliday = (day: number) => {
    const current = form2.getValues("holidays")
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort()
    form2.setValue("holidays", updated)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        {step === 1 ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Work-Log</CardTitle>
              <CardDescription>まず、あなたの氏名を教えてください</CardDescription>
            </CardHeader>
            <form onSubmit={form1.handleSubmit(handleStep1)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">氏名</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="山田 太郎"
                    {...form1.register("fullName")}
                  />
                  {form1.formState.errors.fullName && (
                    <p className="text-sm text-destructive">{form1.formState.errors.fullName.message}</p>
                  )}
                </div>
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="mx-auto mt-4 px-8" disabled={loading}>
                  {loading ? "保存中..." : "次へ"}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Work-Log</CardTitle>
              <CardDescription>クライアント情報を登録してください</CardDescription>
            </CardHeader>
            <form onSubmit={form2.handleSubmit(handleStep2)}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>クライアント名</Label>
                  <Input
                    placeholder="例: 株式会社サンプル"
                    {...form2.register("name")}
                  />
                  {form2.formState.errors.name && (
                    <p className="text-sm text-destructive">{form2.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>標準工数（下限）</Label>
                    <Input
                      type="number"
                      {...form2.register("min_hours", { valueAsNumber: true })}
                    />
                    {form2.formState.errors.min_hours && (
                      <p className="text-sm text-destructive">{form2.formState.errors.min_hours.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>標準工数（上限）</Label>
                    <Input
                      type="number"
                      {...form2.register("max_hours", { valueAsNumber: true })}
                    />
                    {form2.formState.errors.max_hours && (
                      <p className="text-sm text-destructive">{form2.formState.errors.max_hours.message}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>開始時間</Label>
                    <Input
                      type="time"
                      {...form2.register("default_start_time")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>終了時間</Label>
                    <Input
                      type="time"
                      {...form2.register("default_end_time")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>休憩（分）</Label>
                    <Input
                      type="number"
                      {...form2.register("default_rest_minutes", { valueAsNumber: true })}
                    />
                    {form2.formState.errors.default_rest_minutes && (
                      <p className="text-sm text-destructive">{form2.formState.errors.default_rest_minutes.message}</p>
                    )}
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
                      onClick={() => form2.setValue("include_national_holidays", !includeNationalHolidays)}
                    >
                      祝日
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>PDFファイル名テンプレート</Label>
                  <Input
                    placeholder="{YYYY}年{MM}月_稼働報告書"
                    {...form2.register("pdf_filename_template")}
                  />
                  {form2.formState.errors.pdf_filename_template && (
                    <p className="text-sm text-destructive">{form2.formState.errors.pdf_filename_template.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    利用可能な変数: {"{YYYY}"} (年), {"{MM}"} (月), {"{CLIENT}"} (クライアント名)
                  </p>
                </div>
                {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? "保存中..." : "セットアップ完了"}
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
