import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignupCompPage() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-3">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">本登録が完了しました。</h1>
        <p className="text-sm text-muted-foreground">
          ご登録ありがとうございます。
        </p>
      </div>
      <Button asChild className="font-bold">
        <Link href="/dashboard">ダッシュボードへ</Link>
      </Button>
    </div>
  )
}
