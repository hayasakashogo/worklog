import Link from "next/link"
import { BackButton } from "@/components/layout/back-button"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-8">プライバシーポリシー</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. はじめに</h2>
        <p className="text-muted-foreground leading-relaxed">
          Work-Log（以下「本サービス」）は、フリーランス（準委任契約）向けの稼働記録ツールです。
          本ポリシーは、本サービスの利用にあたり収集する情報とその取り扱いについて説明します。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. 収集する情報</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">本サービスでは、以下の情報を収集します。</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
          <li>メールアドレス（メール認証時）</li>
          <li>氏名・プロフィール画像（Google OAuth 認証時）</li>
          <li>勤怠記録データ（出退勤時刻・休憩時間・業務内容など）</li>
          <li>クライアント情報（クライアント名・標準工数・定時設定など）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">3. 利用目的</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">収集した情報は以下の目的のみに使用します。</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
          <li>本サービスの提供および機能の実現</li>
          <li>ユーザー認証とアカウント管理</li>
          <li>稼働報告書 PDF の生成</li>
          <li>サービスの品質向上および機能改善</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">4. データの管理</h2>
        <p className="text-muted-foreground leading-relaxed">
          本サービスのデータは Supabase（PostgreSQL）に保存されます。
          すべてのデータは Row Level Security（RLS）によりアクセス制御されており、
          ユーザー本人のデータにのみアクセスできます。
          データは不正アクセス・紛失・改ざんを防ぐために適切な技術的措置を講じています。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">5. 第三者への提供</h2>
        <p className="text-muted-foreground leading-relaxed">
          法令に基づく開示が必要な場合を除き、ユーザーの情報を第三者に提供・販売・貸与することはありません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">6. お問い合わせ</h2>
        <p className="text-muted-foreground leading-relaxed">
          プライバシーポリシーに関するご質問は、
          <Link href="/contact" className="text-primary underline underline-offset-4">お問い合わせページ</Link>
          よりご連絡ください。
        </p>
      </section>

      <p className="text-xs text-muted-foreground">最終更新日: 2026年3月</p>
    </div>
  )
}
