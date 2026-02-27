"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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

const DEFAULT_CLIENT = {
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

export function SetupWizard({ initialFullName }: { initialFullName: string }) {
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState(initialFullName)
  const [form, setForm] = useState(DEFAULT_CLIENT)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) return
    setLoading(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError("セッションが切れました。再度ログインしてください。")
      setLoading(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", user.id)

    if (error) {
      setError("氏名の保存に失敗しました。")
      setLoading(false)
      return
    }

    setLoading(false)
    setStep(2)
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError("")

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError("セッションが切れました。再度ログインしてください。")
      setLoading(false)
      return
    }

    const { data: newClient, error } = await supabase
      .from("clients")
      .insert({
        name: form.name.trim(),
        min_hours: form.min_hours,
        max_hours: form.max_hours,
        default_start_time: form.default_start_time,
        default_end_time: form.default_end_time,
        default_rest_minutes: form.default_rest_minutes,
        holidays: form.holidays,
        include_national_holidays: form.include_national_holidays,
        pdf_filename_template: form.pdf_filename_template,
        user_id: user.id,
      })
      .select("id")
      .single()

    if (error || !newClient) {
      setError("クライアントの保存に失敗しました。")
      setLoading(false)
      return
    }

    router.push(`/dashboard/${newClient.id}`)
    router.refresh()
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
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        {step === 1 ? (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">Work-Log</CardTitle>
              <CardDescription>まず、あなたの氏名を教えてください</CardDescription>
            </CardHeader>
            <form onSubmit={handleStep1}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">氏名</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="山田 太郎"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading || !fullName.trim()}>
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
            <form onSubmit={handleStep2}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>クライアント名</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例: 株式会社サンプル"
                    required
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
                {error && <p className="text-sm text-destructive">{error}</p>}
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading || !form.name.trim()}>
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
