import Link from "next/link"
import Image from "next/image"
import { UserPlus, Clock, FileDown, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LpHeader } from "@/components/layout/lp-header"
import { LpFooter } from "@/components/layout/lp-footer"

const features = [
  {
    image: "/lp/stamp.png",
    title: "ワンクリック打刻",
    description: "出勤・退勤ボタンを押すだけ。時刻は自動で5分単位に丸められます。",
    checks: ["自動時刻補正（5分単位）", "業務内容メモも同時入力", "休日・祝日を自動判定"],
  },
  {
    image: "/lp/check.png",
    title: "月次勤怠の一覧管理",
    description: "月単位でカレンダー形式に一覧表示。稼働時間の合計も自動集計されます。",
    checks: ["インライン編集で素早く修正", "リアルタイムに複数タブ同期", "月次備考も一括管理"],
  },
  {
    image: "/lp/download.png",
    title: "稼働報告書をワンクリック出力",
    description: "クライアントへの月次報告書をPDFで即座に出力。ファイル名も自動生成。",
    checks: ["入力漏れを事前にチェック", "備考欄付きPDF生成", "ファイル名テンプレートに対応"],
  },
]

const steps = [
  {
    num: "01",
    title: "アカウント登録",
    desc: "メールアドレスまたはGoogleアカウントで1分以内に登録完了。",
    icon: UserPlus,
  },
  {
    num: "02",
    title: "毎日打刻するだけ",
    desc: "出勤・退勤ボタンを押すだけ。時刻は自動で記録されます。",
    icon: Clock,
  },
  {
    num: "03",
    title: "月末にPDF出力",
    desc: "ボタン1つで稼働報告書を生成。そのままクライアントに送付できます。",
    icon: FileDown,
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ページ全体の背景グロー */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[600px] w-[400px] rounded-full bg-primary/6 blur-3xl" />
        <div className="absolute left-0 bottom-1/4 h-[500px] w-[400px] rounded-full bg-primary/7 blur-3xl" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <LpHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 sm:px-12 py-20">
          {/* 背景装飾 */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-background to-background" />
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/12 blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              {/* 左: テキストコンテンツ */}
              <div>
                {/* フィーチャータグ */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {["ワンクリック打刻", "月次勤怠管理", "稼働報告書PDF出力"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-inset ring-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  フリーランスの稼働管理を、
                  <span className="block bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    もっとシンプルに。
                  </span>
                </h1>

                <p className="mt-5 max-w-lg text-muted-foreground">
                  Work-Log は準委任契約のフリーランス向け稼働記録ツールです。
                  日々の勤怠入力から月次の稼働報告書PDF出力まで、これひとつで完結します。
                </p>

                <div className="mt-8 flex flex-col items-center">
                  <Button size="lg" asChild className="px-10 py-6 text-base font-bold shadow-xl shadow-primary/30">
                    <Link href="/signup">無料で始める</Link>
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">クレジットカード不要・完全無料</p>
                </div>
              </div>

              {/* 右: モックアップ */}
              <div className="relative">
                <div aria-hidden className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-primary/10 blur-2xl -z-10" />
                <div className="rounded-xl shadow-2xl shadow-primary/15 overflow-hidden">
                  <Image
                    src="/lp/mock-worklog.png"
                    alt="Work-Log ダッシュボード画面"
                    width={1200}
                    height={750}
                    className="w-full"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-muted/30 px-4 sm:px-12 py-24">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">必要な機能が、すべて揃っています</h2>
              <p className="mt-3 text-muted-foreground">
                フリーランスの稼働管理に特化したシンプルなツールです。
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm flex flex-col">
                  <div className="mb-5 flex justify-center">
                    <div className="rounded-xl bg-primary/10 p-4">
                      <Image src={f.image} alt={f.title} width={140} height={110} className="object-contain" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{f.description}</p>
                  <ul className="space-y-1.5">
                    {f.checks.map((c) => (
                      <li key={c} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how" className="px-4 sm:px-12 py-24">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">3ステップで始められます</h2>
              <p className="mt-3 text-muted-foreground">
                登録から初回の稼働報告書出力まで、最短で当日中に完了します。
              </p>
            </div>

            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-5">
              {steps.flatMap((step, i) => [
                <div
                  key={step.num}
                  className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-sm sm:col-span-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary">STEP {step.num}</span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>,
                i < steps.length - 1 ? (
                  <div key={`arrow-${i}`} className="hidden justify-center sm:flex sm:col-span-1">
                    <ChevronRight className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                ) : null,
              ])}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-y border-primary/10 bg-primary/5 px-4 sm:px-12 py-24 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">今すぐ無料で始めましょう</h2>
            <p className="mt-4 text-muted-foreground">
              クレジットカード不要。登録は1分で完了します。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="w-36 shadow-sm shadow-primary/20 font-semibold">
                <Link href="/signup">無料で始める</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-36 border-primary! bg-white text-primary font-bold hover:bg-primary/5 hover:text-primary">
                <Link href="/login">ログイン</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs text-muted-foreground">完全無料でご利用いただけます</p>
          </div>
        </section>
      </main>

      <LpFooter />
    </div>
  )
}
