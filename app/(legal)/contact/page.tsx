"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BackButton } from "@/components/layout/back-button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const schema = z.object({
  name: z.string().min(1, "お名前を入力してください"),
  email: z.email("有効なメールアドレスを入力してください"),
  message: z.string().min(1, "お問い合わせ内容を入力してください"),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [serverError, setServerError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [pendingData, setPendingData] = useState<FormData | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  const onSubmit = (data: FormData) => {
    setPendingData(data)
  }

  const handleConfirm = async () => {
    if (!pendingData) return
    setServerError("")
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingData),
      })
      if (!res.ok) {
        throw new Error()
      }
      setPendingData(null)
      setIsSubmitted(true)
    } catch {
      setPendingData(null)
      setServerError("送信に失敗しました。しばらく時間をおいてから再度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-8">お問い合わせ</h1>

      {isSubmitted ? (
        <div className="py-16 flex flex-col items-center gap-4 text-center">
          <CheckCircle className="h-12 w-12 text-primary" />
          <h2 className="text-xl font-semibold">お問い合わせを受け付けました</h2>
          <p className="text-muted-foreground text-sm">
            3〜5営業日以内にご登録のメールアドレス宛にご返信いたします。
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">お名前</Label>
            <Input
              id="name"
              type="text"
              placeholder="山田 太郎"
              {...register("name")}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">お問い合わせ内容</Label>
            <Textarea
              id="message"
              placeholder="お問い合わせ内容をご記入ください"
              rows={6}
              {...register("message")}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
          </div>

          {serverError && <p className="text-sm text-destructive">{serverError}</p>}

          <div className="flex justify-center">
            <Button type="submit" className="font-bold">
              内容を確認する
            </Button>
          </div>
        </form>
      )}

      <Dialog open={!!pendingData} onOpenChange={(open) => { if (!open) setPendingData(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>送信内容の確認</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">お名前</p>
              <p className="font-medium">{pendingData?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">メールアドレス</p>
              <p className="font-medium">{pendingData?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">お問い合わせ内容</p>
              <p className="font-medium whitespace-pre-wrap">{pendingData?.message}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPendingData(null)} disabled={isSubmitting}>
              修正する
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "送信中..." : "送信する"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
