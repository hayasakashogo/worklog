import Link from "next/link"
import { BackButton } from "@/components/layout/back-button"

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-8">利用規約</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">1. サービスの概要</h2>
        <p className="text-muted-foreground leading-relaxed">
          Work-Log（以下「本サービス」）は、フリーランス（準委任契約）向けの稼働記録ツールです。
          本規約は、本サービスを利用するすべてのユーザーに適用されます。
          本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">2. 利用条件</h2>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
          <li>個人・商用目的での利用が可能です</li>
          <li>本サービスの再配布・複製・転売は禁止です</li>
          <li>アカウントの共有・第三者への譲渡は禁止です</li>
          <li>利用にはアカウント登録（メールまたは Google OAuth）が必要です</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">3. 禁止事項</h2>
        <p className="text-muted-foreground leading-relaxed mb-2">以下の行為を禁止します。</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
          <li>本サービスの不正利用・過度な負荷をかける行為</li>
          <li>他のユーザーのデータへの不正アクセス</li>
          <li>法令または公序良俗に反する行為</li>
          <li>本サービスの運営を妨害する行為</li>
          <li>虚偽の情報を登録する行為</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">4. 免責事項</h2>
        <p className="text-muted-foreground leading-relaxed">
          本サービスは現状のまま提供されます。
          サービスの中断・停止・データの消失等により生じた損害について、
          運営者は一切の責任を負いません。
          本サービスの利用はユーザー自身の責任で行ってください。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">5. 変更・終了</h2>
        <p className="text-muted-foreground leading-relaxed">
          運営者は事前の告知なく、本規約・本サービスの内容を変更または終了する場合があります。
          重要な変更がある場合は、サービス内での通知を行います。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">6. お問い合わせ</h2>
        <p className="text-muted-foreground leading-relaxed">
          利用規約に関するご質問は、
          <Link href="/contact" className="text-primary underline underline-offset-4">お問い合わせページ</Link>
          よりご連絡ください。
        </p>
      </section>

      <p className="text-xs text-muted-foreground">最終更新日: 2026年3月</p>
    </div>
  )
}
