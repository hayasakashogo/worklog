import Image from "next/image"
import Link from "next/link"

export default function SignupCompPage() {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div className="space-y-3">
        <div className="flex justify-center">
          <Image src="/mail.png" alt="メール送信" width={160} height={120} />
        </div>
        <h1 className="text-2xl font-bold">本登録メールを送信しました。</h1>
        <p className="text-sm text-muted-foreground">
          ご登録のメールアドレスに確認メールをお送りしました。
          <br />
          メール内のリンクをクリックして、本登録を完了してください。
        </p>
      </div>

      <Link href="/login" className="text-sm font-bold text-primary hover:underline">
        ログインページへ
      </Link>
    </div>
  )
}
