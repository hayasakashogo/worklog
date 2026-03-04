"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  const onSubmit = async (data: FormData) => {
    setServerError("")
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: exists, error } = await supabase.rpc("is_email_registered", { email_input: data.email })
    if (error || !exists) {
      setServerError("このメールアドレスは登録されていません")
      setIsSubmitting(false)
      return
    }
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password/update`,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-3">
          <div className="flex justify-center">
            <Image src="/mail.png" alt="メール送信" width={160} height={120} />
          </div>
          <h1 className="text-2xl font-bold">メールを送信しました</h1>
          <p className="text-sm text-muted-foreground">
            パスワードリセット用のリンクをメールでお送りしました。
            <br />
            メール内のリンクをクリックして、パスワードを再設定してください。
          </p>
        </div>
        <Link href="/login" className="text-sm font-bold text-primary hover:underline">
          ログインページへ
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">パスワードリセット</h1>
        <p className="text-sm text-muted-foreground">登録済みのメールアドレスを入力してください</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <div className="flex justify-center">
          <Button type="submit" className="font-bold" disabled={isSubmitting}>
            {isSubmitting ? "送信中..." : "リセットメールを送信"}
          </Button>
        </div>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary underline underline-offset-4 font-bold">
          ログインに戻る
        </Link>
      </p>
    </div>
  )
}
