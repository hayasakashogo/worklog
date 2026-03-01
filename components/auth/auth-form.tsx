"use client"

import { FcGoogle } from "react-icons/fc"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export async function handleGoogleAuth() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  })
}

export function localizeError(message: string): string {
  if (message.includes("Invalid login credentials")) return "メールアドレスまたはパスワードが正しくありません"
  if (message.includes("Email not confirmed")) return "メールアドレスが確認されていません"
  if (message.includes("User already registered")) return "このメールアドレスはすでに登録されています"
  if (message.includes("too many requests") || message.includes("rate limit")) return "しばらく待ってから再試行してください"
  return message
}

export function GoogleAuthButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" className="w-full" onClick={onClick}>
      <FcGoogle className="h-4 w-4" />
      <span className="ml-2">{label}</span>
    </Button>
  )
}

export function FormDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">または</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
