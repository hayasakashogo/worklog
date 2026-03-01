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
- `app/(auth)/` — ログイン・サインアップページ（パブリック）。認証方法は email + password と Google OAuth の2方式。サインアップ後の氏名収集は `/dashboard/new` で行う
  - `app/(auth)/layout.tsx` — 認証ページ共通レイアウト（Work-Log ロゴ・テーマトグル付きヘッダー＋中央揃えコンテンツ）
  - `app/(auth)/signup/comp/page.tsx` — メール確認案内ページ（signup 成功後にリダイレクト）
- `app/auth/callback/route.ts` — Google OAuth コールバックハンドラ。Supabase の `exchangeCodeForSession` でセッション確立後 `/dashboard` にリダイレクト
- `app/(app)/` — 認証済みルート。サイドバーレイアウト付き
- `app/page.tsx` — ランディングページ（パブリック、未認証でもアクセス可）
- `app/layout.tsx` — ルートレイアウト。`ThemeProvider`（next-themes）・`TooltipProvider`（shadcn/ui）・`Toaster`（sonner、`toastOptions.style` で `color-mix` を使ったプライマリカラーベースのスタイル）を配置
- `proxy.ts` — Next.js 16 proxy。未認証ユーザーを `/login` にリダイレクト。`/auth/callback` はパブリックページとして許可

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
- **time_records** — 日次の勤怠記録。`(client_id, date)` のユニーク制約あり。`start_time`/`end_time` は nullable な time 型、`rest_minutes` は integer、`is_off` は boolean（休み）、`note` は text（業務内容・備考）
- スキーマ SQL: `supabase/schema.sql`
- マイグレーションは Supabase MCP で管理

### 主要ユーティリティ
- `lib/time-utils.ts` — `floorToFiveMinutes()`（打刻時刻を5分単位で切り捨て）、`floorTimeStringToFiveMinutes()`（HH:MM 形式の文字列を5分単位で切り捨て）、`calcWorkingHours()`、`formatHoursToHHMM()`、`timeToMinutes()`、`todayString()`
- `lib/holidays.ts` — `japanese-holidays` ライブラリのラッパー。`isHoliday()` は boolean、`getHolidayLabel()` は祝日名、`getDaysInMonth()`、`getWeekdayLabel()`、`isClientHoliday()`（クライアント設定の曜日休日・祝日設定を考慮した休日判定）を提供
- `lib/pdf/generate-report.ts` — jspdf + jspdf-autotable で稼働報告書 PDF を生成。NotoSansJP フォントを `/public/fonts/` から読み込み

### 主要コンポーネント
- `components/auth/auth-form.tsx` — 認証フォーム共通ユーティリティ。`handleGoogleAuth()`（Google OAuth 開始）・`localizeError(message)`（Supabase エラーの日本語化）・`GoogleAuthButton`・`FormDivider` を提供。ログイン・サインアップページで共用
- `components/layout/app-sidebar.tsx` — サイドバー。`clients`・`fullName: string`・`avatarUrl?: string` を props で受け取る。`avatarUrl` がある場合は Next.js `Image` で Google プロフィール画像を表示、ない場合は User アイコンにフォールバック。ヘッダーに Work-Log ロゴ（`/` へのリンク）・クライアントプルダウン（切り替え時は現在のページ種別を維持しつつ遷移: records ページは同じ yearMonth を保持、clients ページは clients ページへ、それ以外は打刻ページへ）・切り替え時に sonner トースト通知・ユーザーアバターと表示名インライン編集（鉛筆アイコン → 入力フィールド＋保存/キャンセルボタン、`profiles.full_name` を Supabase で更新）。ナビメニュー（打刻・勤怠一覧・クライアント管理）の下にログアウトボタンを配置。`app/(app)/layout.tsx` が `profiles` から取得した `fullName` と `user.user_metadata.avatar_url` を渡す
- `components/layout/theme-toggle.tsx` — ダークモード切り替えボタン（Sun/Moon アイコン）。`app/(app)/layout.tsx` のヘッダー右端（`ml-auto`）に配置
- `components/dashboard/clock-display.tsx` — リアルタイムクロック表示（1秒ごとに更新）。ハイドレーション対策で初期値を `null` にしクライアントマウント後に時刻をセット。日付（年月日・曜日）と時刻（HH:MM:SS）を表示し、時刻はグラデーションテキスト（`bg-gradient-to-br from-foreground to-foreground/60`）で描画
- `components/dashboard/punch-buttons.tsx` — 出退勤ボタン。`client` と `initialRecord` を props で受け取り、Realtime でライブ更新。`is_off`（本日休み）チェックボックス・`note`（業務内容・備考）テキストエリア（onBlur 保存）を備える。`isClientHoliday()` でクライアント設定の休日を自動判定し `is_off` 初期値に反映。ステータスに応じたカードのグラデーションバーと状態バッジ（出勤中はパルスアニメーション）を表示
- `components/records/records-page-content.tsx` — 勤怠一覧ページの Client Component。PDF出力時の勤怠漏れチェック結果（`highlightDates`）を状態管理し、漏れがある場合は警告バナーを表示。`MonthlyTable` と `ExportPdfButton` を組み合わせる
- `components/records/monthly-table.tsx` — 月次勤怠テーブル。`client`, `initialRecords`, `year`, `month`, `highlightDates?` を props で受け取り、月切り替えは `router.push` でURL遷移。列構成: 日・曜日（祝日名をサブテキストで表示）・休みチェックボックス・開始・終了・休憩・稼働時間・業務内容備考。セルはクリックで編集モードに入るインライン編集方式（`renderEditableCell`）で、`note` 列はクリックで `Textarea`、時刻・数値列は `Input` に切り替わる。開始・終了時刻は5分刻み（`step={300}`）、休憩は5分刻み数値入力。保存時に `floorTimeStringToFiveMinutes()` で時刻を5分単位に切り捨て。ヘッダーに合計稼働時間・標準工数範囲・推定稼働時間を表示。`isClientHoliday()` でクライアント設定の休日を自動判定し `is_off` デフォルト値に反映。Realtime でタブ間同期。`highlightDates` に含まれる日付のセルは赤枠強調表示
- `components/records/export-pdf-button.tsx` — PDF出力ボタン。`client`, `year`, `month`, `onMissingCheck` を props で受け取る。クリック時にまず稼働データ有無を確認（なければ sonner でエラートースト「この月には稼働データがありません」を表示して終了）。次に勤怠漏れチェック（`computeMissingDates`）を実行し（過去・今日・未来日を問わず非休日の勤務日でレコードがない or 未入力を漏れとみなす）、漏れがあれば `onMissingCheck` コールバックに日付リストを渡して終了。漏れがなければ `generateReportBlobUrl` で PDF を生成してプレビューダイアログ（`<Dialog>` + `<iframe>`）を開き、ダイアログ内のダウンロードボタンで `generateReport` を呼び出してファイル保存する
- `components/clients/clients-page-content.tsx` — クライアント管理画面の Client Component。`clients` と `currentClientId` を props で受け取る。Table レイアウトで一覧表示し、各行にラジオボタン（アクティブクライアント切り替え）・クライアント名・標準工数（min〜max h）・定時（開始〜終了）・休憩分・休み設定（曜日＋祝日）・編集ボタン・削除ボタンを表示。ラジオボタン変更時は `router.push` でクライアント切り替えと `sonner` トースト通知。削除時は confirm ダイアログ表示後 Supabase で削除し、削除対象が現在のクライアントなら `/dashboard` にリダイレクト
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
- フォームバリデーション: `react-hook-form` + `zod`（`@hookform/resolvers` 経由）を使用
- フォームの送信中状態は `react-hook-form` の `formState.isSubmitting` を使わず `useState` で自前管理する。これにより `router.push` 後もボタンが「処理中」表示のままページ遷移できる
- ドキュメント: `.docs/要件定義.md`（要件定義）、`.docs/実装プラン.md`（実装プラン）、`.docs/メモ.md`（機能メモ・改善候補）
