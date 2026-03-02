import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 text-center">
      <Image src="/notfound.png" alt="ページが見つかりません" width={300} height={200} />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-muted-foreground">お探しのページは見つかりませんでした。</p>
      </div>
      <Link href="/" className="text-sm font-bold text-primary hover:underline">
        トップページへ戻る
      </Link>
    </div>
  )
}
