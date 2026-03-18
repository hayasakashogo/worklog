# Work-Log

フリーランス（準委任契約）向けの稼働記録ツール。日々の勤怠入力から月次の稼働報告書 PDF 出力まで、これひとつで完結します。

![Work-Log モック画像](/public/mock-worklog.jpg)

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript（strict mode） |
| スタイリング | Tailwind CSS v4 + shadcn/ui（New York スタイル） |
| バックエンド/認証 | Supabase（PostgreSQL、Email + Google OAuth、Realtime） |
| フォーム | React Hook Form + Zod |
| アニメーション | Framer Motion |
| PDF 生成 | jsPDF + jspdf-autotable（NotoSansJP フォント） |
| テスト | Jest + React Testing Library |

## セットアップ

**前提条件**
- Node.js 20+
- npm
- Supabase プロジェクト

**環境変数**

`.env.local` を作成し、以下を設定:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SLACK_WEBHOOK_URL=        # お問い合わせ通知用（任意）
```

**インストール・起動**

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) で確認できます。

また、`supabase/schema.sql` を Supabase プロジェクトで実行してください。

## コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint 実行 |
| `npm test` | テスト実行 |
| `npm run test:watch` | テスト（ウォッチモード） |

## ディレクトリ構成

```
app/
  (auth)/     — ログイン・サインアップ・パスワードリセット（パブリック）
  (app)/      — 認証済みルート（打刻・勤怠一覧・クライアント管理）
  (legal)/    — プライバシーポリシー・利用規約・お問い合わせ
  auth/       — OAuth・メール確認コールバック
components/
  ui/         — shadcn/ui コンポーネント
  layout/     — サイドバー・ヘッダー・フッターなど共通レイアウト
  dashboard/  — 打刻（ClockDisplay, PunchButtons）
  records/    — 月次勤怠テーブル・PDF 出力ボタン
  clients/    — クライアント管理
  lp/         — ランディングページ専用コンポーネント
lib/
  supabase/   — ブラウザ・サーバー・ミドルウェア用クライアント
  time-utils.ts     — 時刻計算・フォーマット
  holidays.ts       — 祝日・休日判定
  missing-dates.ts  — 勤怠漏れチェック
  pdf/              — 稼働報告書 PDF 生成
```

## 実装のポイント

**リアルタイム同期**

Supabase Realtime を使い、`time_records` テーブルの変更をタブ間でリアルタイム同期。Server Component で初期データを取得し、Client Component が Realtime チャンネルをサブスクライブするハイブリッド構成。

**状態管理**

URL ベースで状態を管理（`clientId`・`yearMonth` をパスパラメータとして保持）。Redux / Zustand は不使用。Supabase クエリはコンポーネント内で直接実行。

**認証**

メールアドレス + パスワードおよび Google OAuth の2方式に対応。Supabase SSR でサーバーサイドセッション管理を行い、ミドルウェアレベルで認証チェック。

**PDF 出力**

jsPDF + jspdf-autotable で稼働報告書を生成。出力前に未入力日をチェックし、漏れがある場合は警告を表示。ファイル名はクライアントごとのテンプレート（`{YYYY}`, `{MM}`, `{CLIENT}`）から自動生成。

**複数クライアント対応**

クライアントごとに標準工数・定時・休日曜日・祝日設定・PDF ファイル名テンプレートを個別管理。サイドバーのプルダウンで切り替え可能。
