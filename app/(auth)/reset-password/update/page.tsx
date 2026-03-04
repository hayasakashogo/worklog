"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { localizeError } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

const schema = z.object({
  password: z.string().min(6, "パスワードは6文字以上で入力してください"),
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordUpdatePage() {
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
    const { error } = await supabase.auth.updateUser({ password: data.password })
    if (error) {
      setServerError(localizeError(error.message))
      setIsSubmitting(false)
      return
    }
    await supabase.auth.signOut()
    router.push("/login?reset=1")
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">新しいパスワードの設定</h1>
        <p className="text-sm text-muted-foreground">新しいパスワードを入力してください</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">新しいパスワード</Label>
          <PasswordInput
            id="password"
            placeholder="6文字以上で入力"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">パスワード（確認）</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="パスワードを再入力"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <div className="flex justify-center">
          <Button type="submit" className="font-bold" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "パスワードを変更"}
          </Button>
        </div>
      </form>
    </div>
  )
}
