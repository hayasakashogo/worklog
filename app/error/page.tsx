"use client"

import Image from "next/image"
import Link from "next/link"

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-6 text-center">
      <Image src="/error.png" alt="エラーが発生しました" width={300} height={200} />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="text-muted-foreground">申し訳ございません。予期せぬエラーが発生しました。</p>
      </div>
      <Link href="/" className="text-sm font-bold text-primary hover:underline">
        トップページへ戻る
      </Link>
    </div>
  )
}
