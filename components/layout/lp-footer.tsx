import Link from "next/link"

export function LpFooter() {
  return (
    <footer className="border-t px-4 sm:px-12 py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 sm:flex-row">
        <Link href="/" className="text-sm font-bold text-primary">
          Work-Log
        </Link>
        <p className="text-xs text-muted-foreground">
          準委任契約フリーランス向け稼働記録ツール &nbsp;·&nbsp; &copy; 2026 Work-Log
        </p>
        <div className="flex gap-4 text-xs">
          <Link href="/privacy" className="text-primary hover:underline">プライバシーポリシー</Link>
          <Link href="/terms" className="text-primary hover:underline">利用規約</Link>
        </div>
      </div>
    </footer>
  )
}
