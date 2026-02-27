# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイドラインです。

## プロジェクト概要

Work-Log はフリーランス（準委任契約）向けの稼働記録ツールです。Next.js 16 (App Router)、Supabase (Auth + PostgreSQL)、shadcn/ui で構築されています。UIテキストはすべて日本語です。

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # 本番ビルド
npm run lint         # ESLint
npm test             # テスト実行 (Jest)
npm run test:watch   # テスト実行（ウォッチモード）
```

## アーキテクチャ

### ルートグループ
- `app/(auth)/` — ログイン・サインアップページ（パブリック）。サインアップは email + password のみ（氏名は `/dashboard/new` で収集）
- `app/(app)/` — 認証済みルート。サイドバーレイアウト付き
- `app/page.tsx` — ランディングページ（パブリック、未認証でもアクセス可）
- `proxy.ts` — Next.js 16 proxy。未認証ユーザーを `/login` にリダイレクト

### 動的ルーティング（`app/(app)/dashboard/`）
- `/dashboard` → クライアントがあれば最初の `/dashboard/[clientId]` に、なければ `/dashboard/new` にリダイレクト
- `/dashboard/new` — 初回セットアップウィザード（Server Component）。新規ユーザーが氏名とクライアント情報を登録する
- `/dashboard/[clientId]` — 打刻ダッシュボード（Server Component）
- `/dashboard/[clientId]/records/[yearMonth]` — 月次勤怠一覧（Server Component、例: `2026-02`）
- `/dashboard/[clientId]/records` → 当月にリダイレクト
- `/dashboard/[clientId]/clients` — クライアント管理（Server Component）
- `[clientId]/layout.tsx` で clientId の存在バリデーション（不正なら `notFound()`）。`clientId === "new"` は静的ルートが優先されるためこのレイアウトには到達しない

### 状態管理
- **URL ベース** — `clientId` と `yearMonth` を URL パラメータで管理。`ClientProvider` は廃止済み
- サーバーコンポーネントで初回データをフェッチし、Client Component に `initialRecord` / `initialRecords` として props で渡す
- Redux/Zustand は不使用。Supabase クエリはコンポーネント内で直接実行
- 共有型定義: `types/client.ts`（`Client` 型）

### Supabase 連携
- `lib/supabase/client.ts` — ブラウザクライアント (`createBrowserClient`)
- `lib/supabase/server.ts` — サーバークライアント（Cookie 使用）
- `lib/supabase/middleware.ts` — `proxy.ts` から呼ばれるセッション更新ヘルパー
- `time_records` テーブルで Supabase Realtime を有効化（タブ間のリアルタイム同期）

### データベース（3テーブル、すべて RLS `auth.uid() = user_id`）
- **profiles** — `auth.users` への INSERT 時にトリガーで自動作成。フィールド: `id`, `full_name`
- **clients** — ユーザーごとのクライアント設定。`holidays`（int[]、休日曜日）、`include_national_holidays`（bool）、`default_start_time/end_time/rest_minutes`、`min_hours/max_hours`、`pdf_filename_template`
- **time_records** — 日次の勤怠記録。`(client_id, date)` のユニーク制約あり。`start_time`/`end_time` は nullable な time 型、`rest_minutes` は integer
- スキーマ SQL: `supabase/schema.sql`
- マイグレーションは Supabase MCP で管理

### 主要ユーティリティ
- `lib/time-utils.ts` — `floorToFiveMinutes()`（打刻時刻を5分単位で切り捨て）、`calcWorkingHours()`、`formatHoursToHHMM()`、`timeToMinutes()`、`todayString()`
- `lib/holidays.ts` — `japanese-holidays` ライブラリのラッパー。`isHoliday()` は boolean、`getHolidayLabel()` は祝日名、`getDaysInMonth()`、`getWeekdayLabel()` を提供
- `lib/pdf/generate-report.ts` — jspdf + jspdf-autotable で稼働報告書 PDF を生成。NotoSansJP フォントを `/public/fonts/` から読み込み

### 主要コンポーネント
- `components/layout/app-sidebar.tsx` — サイドバー。`clients` と `fullName: string` を props で受け取る。ヘッダーに Work-Log ロゴ（`/` へのリンク）・クライアントプルダウン・表示名インライン編集（鉛筆アイコン → 入力フィールド）。`app/(app)/layout.tsx` が `profiles` から取得した `fullName` を渡す
- `components/layout/theme-toggle.tsx` — ダークモード切り替えボタン（Sun/Moon アイコン）。`app/(app)/layout.tsx` のヘッダー右端（`ml-auto`）に配置
- `components/dashboard/clock-display.tsx` — リアルタイムクロック表示（1秒ごとに更新）
- `components/dashboard/punch-buttons.tsx` — 出退勤ボタン。`client` と `initialRecord` を props で受け取り、Realtime でライブ更新。休憩時間は分単位の数値入力（`type="number"`、5分刻み）
- `components/records/records-page-content.tsx` — 勤怠一覧ページの Client Component。PDF出力時の勤怠漏れチェック結果（`highlightDates`）を状態管理し、漏れがある場合は警告バナーを表示。`MonthlyTable` と `ExportPdfButton` を組み合わせる
- `components/records/monthly-table.tsx` — 月次勤怠テーブル。`client`, `initialRecords`, `year`, `month`, `highlightDates?` を props で受け取り、月切り替えは `router.push` でURL遷移。開始・終了時刻は5分刻み（`step={300}`）、休憩は分単位の数値入力（`type="number"`、5分刻み）。レコードなしの日は休憩列が空欄
- `components/records/export-pdf-button.tsx` — PDF出力ボタン。`client`, `year`, `month` を props で受け取る
- `components/clients/clients-page-content.tsx` — クライアント管理画面の Client Component
- `components/clients/client-form-dialog.tsx` — クライアント追加・編集フォームダイアログ（`clients-page-content` から利用）
- `components/setup/setup-wizard.tsx` — 初回セットアップウィザード（Client Component）。2ステップ形式: Step1で氏名を `profiles` に保存、Step2でクライアント情報を `clients` に INSERT して `/dashboard/{id}` に遷移

### スタイリング
- オレンジのプライマリカラーを CSS 変数 (oklch) で `app/globals.css` に定義
- `next-themes` による class ストラテジーのダークモード
- `lib/utils.ts` の `cn()` で条件付きクラス名を結合（clsx + tailwind-merge）
- Tailwind CSS v4（PostCSS プラグイン、tailwind.config ファイルなし。テーマは globals.css にインライン定義）

### テスト
- Jest + React Testing Library（`jest.config.ts`、`jest.setup.ts`）
- テストは `__tests__/` ディレクトリにソース構造をミラーして配置
- `__tests__/lib/time-utils.test.ts`、`__tests__/lib/holidays.test.ts`

## 環境変数

`.env.local` に以下を設定:
```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

## コーディング規約

- インタラクティブなコンポーネントには `"use client"` ディレクティブを付与
- コンポーネントファイルは kebab-case、`components/` 配下に機能ごとに整理
- shadcn/ui コンポーネントは `components/ui/` に配置（style: new-york、icon: lucide）
- パスエイリアス `@/` はプロジェクトルートを指す（`src/` ではない）
- ドキュメント: `.docs/要件定義.md`（要件定義）、`.docs/実装プラン.md`（実装プラン）、`.docs/メモ.md`（機能メモ・改善候補）
