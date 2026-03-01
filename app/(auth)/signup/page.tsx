"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleAuthButton, FormDivider, localizeError, handleGoogleAuth } from "@/components/auth/auth-form"

const schema = z.object({
  email: z.email("有効なメールアドレスを入力してください"),
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
})

type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const [serverError, setServerError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onTouched",
  })

  const onSubmit = async (data: FormData) => {
    setServerError("")
    setIsSubmitting(true)
    const supabase = createClient()
    const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password })
    if (error) {
      setServerError(localizeError(error.message))
      setIsSubmitting(false)
      return
    }
    // Supabase はメール確認が有効な場合、既存メールでも error を返さない（列挙攻撃防止）
    // identities が空配列の場合は既存ユーザー
    if (authData.user?.identities?.length === 0) {
      setServerError("このメールアドレスはすでに登録されています")
      setIsSubmitting(false)
      return
    }
    router.push("/signup/comp")  // isSubmitting は true のまま遷移
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">アカウント作成</h1>
        <p className="text-sm text-muted-foreground">新しいアカウントを登録</p>
      </div>

      <GoogleAuthButton label="Googleで登録" onClick={handleGoogleAuth} />

      <FormDivider />

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
        <div className="space-y-2">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            placeholder="6文字以上"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : "アカウント作成"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-primary underline underline-offset-4">
          ログイン
        </Link>
      </p>
    </div>
  )
}
