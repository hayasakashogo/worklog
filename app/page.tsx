import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">Work-Log</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              新規登録
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            フリーランスの稼働管理を、
            <br />
            もっとシンプルに。
          </h2>
          <p className="max-w-[600px] text-lg text-muted-foreground">
            Work-Log は準委任契約のフリーランス向け稼働記録ツールです。
            日々の勤怠入力から月次の稼働報告書PDF出力まで、これひとつで完結します。
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            無料で始める
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-md border border-input bg-background px-8 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            ログイン
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        &copy; 2026 Work-Log
      </footer>
    </div>
  )
}
