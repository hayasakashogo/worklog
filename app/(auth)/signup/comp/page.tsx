import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignupCompPage() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-3">
        <div className="text-5xl">✉️</div>
        <h1 className="text-2xl font-bold">確認メールを送信しました</h1>
        <p className="text-sm text-muted-foreground">
          ご登録のメールアドレスに確認メールをお送りしました。
          <br />
          メール内のリンクをクリックして、アカウントを有効にしてください。
        </p>
      </div>

      <Button asChild variant="outline" className="w-full">
        <Link href="/login">ログインページへ</Link>
      </Button>
    </div>
  )
}
