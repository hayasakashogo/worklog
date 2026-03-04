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
  - `app/(auth)/signup/conf/page.tsx` — メール確認案内ページ（signup 成功後にリダイレクト）。`mail.png` 画像付き。送信完了メッセージとログインページへのリンクを表示
  - `app/(auth)/signup/comp/page.tsx` — 本登録完了ページ（メール確認リンクから `/auth/callback?next=/signup/comp` 経由で到達）。`CheckCircle` アイコン + 完了メッセージ + ダッシュボードボタン。認証済みユーザーのみアクセス可（未認証は `/login` にリダイレクト）
  - `app/(auth)/reset-password/page.tsx` — パスワードリセットリクエストページ（Client Component）。`is_email_registered` RPC でメール存在確認後、`resetPasswordForEmail` でリセットメール送信（`redirectTo: /auth/callback?next=/reset-password/update`）。送信後はインライン完了メッセージ表示
  - `app/(auth)/reset-password/update/page.tsx` — 新しいパスワード設定ページ（Client Component）。パスワード・確認パスワードフォーム（zod で一致バリデーション）。`PasswordInput` コンポーネントで表示/非表示トグル付き。`updateUser` でパスワード更新後 `/login?reset=1` にリダイレクトしてサインアウト
- `app/auth/callback/route.ts` — OAuth・メール確認コールバックハンドラ。Supabase の `exchangeCodeForSession` でセッション確立後、`next` クエリパラメータの URL にリダイレクト（デフォルト `/dashboard`）。エラー時は `/error` にリダイレクト。パスワードリセット時は `next=/reset-password/update`、メール本登録完了時は `next=/signup/comp` で使用
- `app/(app)/` — 認証済みルート。サイドバーレイアウト付き
- `app/(legal)/` — 法律情報ページ（パブリック）。LpHeader・LpFooter でラッピングした共通レイアウト
  - `app/(legal)/privacy/page.tsx` — プライバシーポリシーページ（収集情報・利用目的・データ管理・第三者提供などを日本語で記載）
  - `app/(legal)/terms/page.tsx` — 利用規約ページ（サービス概要・利用条件・禁止事項・免責事項などを日本語で記載）
  - `app/(legal)/contact/page.tsx` — お問い合わせページ。react-hook-form + zod によるバリデーション付きフォーム（お名前・メールアドレス・お問い合わせ内容）。送信前に確認ダイアログを表示する2段階送信フロー。送信成功時は CheckCircle アイコン付きの完了メッセージをインライン表示（トーストなし）。API は `/api/contact` に POST し Slack Webhook で通知
- `app/page.tsx` — ランディングページ（パブリック、未認証でもアクセス可）。LpHeader / LpFooter を使ったレイアウト。フィーチャーセクション（ワンクリック打刻・月次勤怠管理・PDF出力・複数クライアント対応）を2列グリッドで表示
- `app/loading.tsx` — グローバルローディングスピナー（`min-h-screen` 中央揃え、`animate-spin` + `animate-pulse`）
- `app/not-found.tsx` — グローバル404ページ。`notfound.png` 画像付きでトップページへのリンクを表示
- `app/error/page.tsx` — エラーページ（パブリック）。`error.png` 画像付きでトップページへのリンクを表示。`app/auth/callback/route.ts` のエラー時にリダイレクト先として使用
- `app/layout.tsx` — ルートレイアウト。`ThemeProvider`（next-themes）・`TooltipProvider`（shadcn/ui）・`Toaster`（sonner、`toastOptions.style` で `color-mix` を使ったプライマリカラーベースのスタイル）を配置
- `proxy.ts` — Next.js 16 proxy。未認証ユーザーを `/login` にリダイレクト。パブリックページ（`/`・`/login`・`/signup`（`/signup/comp` を除く）・`/auth/callback`・`/privacy`・`/terms`・`/contact`・`/reset-password`・`/error`）は認証なしでアクセス可能

### API エンドポイント
- `app/api/contact/route.ts` — お問い合わせ API（パブリック）。POST で `{ name, email, message }` を受け取り、`SLACK_WEBHOOK_URL` 環境変数に設定された Slack Webhook URL へ通知を送信

### 動的ルーティング（`app/(app)/dashboard/`）
- `/dashboard` → クライアントがあれば最初の `/dashboard/[clientId]` に、なければ `/dashboard/new` にリダイレクト
- `/dashboard/new` — 初回セットアップウィザード（Server Component）。新規ユーザーが氏名とクライアント情報を登録する
- `/dashboard/[clientId]` — 打刻ダッシュボード（Server Component）
- `/dashboard/[clientId]/records/[yearMonth]` — 月次勤怠一覧（Server Component、例: `2026-02`）
- `/dashboard/[clientId]/records` → 当月にリダイレクト
- `/dashboard/[clientId]/clients` — クライアント管理（Server Component）
- `[clientId]/layout.tsx` で clientId の存在バリデーション（不正なら `notFound()`）。`clientId === "new"` は静的ルートが優先されるためこのレイアウトには到達しない
- `app/(app)/dashboard/[clientId]/loading.tsx` — 打刻ページのスケルトン（ClockDisplay・PunchButtons カード）
- `app/(app)/dashboard/[clientId]/records/[yearMonth]/loading.tsx` — 月次勤怠ページのスケルトン（CardHeader の PDF ボタン・月タイトル・stats・テーブル22行）
- `app/(app)/dashboard/[clientId]/clients/loading.tsx` — クライアント管理ページのスケルトン（Card + テーブル3行）
- スケルトンは Next.js App Router の `loading.tsx` 規約（Suspense boundary）を利用。`layout.tsx` のサイドバーはそのままで、コンテンツエリアのみスケルトンを表示する

### 状態管理
- **URL ベース** — `clientId` と `yearMonth` を URL パラメータで管理。`ClientProvider` は廃止済み
- サーバーコンポーネントで初回データをフェッチし、Client Component に `initialRecord` / `initialRecords` として props で渡す
- Redux/Zustand は不使用。Supabase クエリはコンポーネント内で直接実行
- 共有型定義: `types/client.ts`（`Client` 型）

### Supabase 連携
- `lib/supabase/client.ts` — ブラウザクライアント (`createBrowserClient`)
- `lib/supabase/server.ts` — サーバークライアント（Cookie 使用）
- `lib/supabase/middleware.ts` — `proxy.ts` から呼ばれるセッション更新・認証ルーティングヘルパー。未認証ユーザーをパブリックページ以外から `/login` にリダイレクト、認証済みユーザーが認証ページ（`/login`・`/signup`）にアクセスした場合は `/dashboard` にリダイレクト。`/signup/comp` は認証済み必須ページのため `isAuthPage`・`isPublicPage` 両方から除外
- `time_records` テーブルで Supabase Realtime を有効化（タブ間のリアルタイム同期）

### データベース（4テーブル、すべて RLS `auth.uid() = user_id`）
- **profiles** — `auth.users` への INSERT 時にトリガーで自動作成。フィールド: `id`, `full_name`
- **clients** — ユーザーごとのクライアント設定。`holidays`（int[]、休日曜日）、`include_national_holidays`（bool）、`default_start_time/end_time/rest_minutes`、`min_hours/max_hours`、`pdf_filename_template`
- **time_records** — 日次の勤怠記録。`(client_id, date)` のユニーク制約あり。`start_time`/`end_time` は nullable な time 型、`rest_minutes` は integer、`is_off` は boolean（休み）、`note` は text（業務内容・備考）
- **monthly_notes** — 月次備考。`(user_id, client_id, year_month)` のユニーク制約あり。`year_month` は `YYYY-MM` 形式の text、`note` は text
- スキーマ SQL: `supabase/schema.sql`
- マイグレーションは Supabase MCP で管理

### 主要ユーティリティ
- `lib/time-utils.ts` — `floorToFiveMinutes()`（打刻時刻を5分単位で切り捨て）、`floorTimeStringToFiveMinutes()`（HH:MM 形式の文字列を5分単位で切り捨て）、`calcWorkingHours()`、`formatHoursToHHMM()`、`timeToMinutes()`、`todayString()`
- `lib/holidays.ts` — `japanese-holidays` ライブラリのラッパー。`isHoliday()` は boolean、`getHolidayLabel()` は祝日名、`getDaysInMonth()`、`getWeekdayLabel()`、`isClientHoliday()`（クライアント設定の曜日休日・祝日設定を考慮した休日判定）を提供
- `lib/pdf/generate-report.ts` — jspdf + jspdf-autotable で稼働報告書 PDF を生成。NotoSansJP フォントを `/public/fonts/` から読み込み。備考欄はページ幅50%の枠線付きで常に描画（空でも表示）し、改行・折り返しに対応

### 主要コンポーネント
- `components/auth/auth-form.tsx` — 認証フォーム共通ユーティリティ。`handleGoogleAuth()`（Google OAuth 開始）・`localizeError(message)`（Supabase エラーの日本語化）・`GoogleAuthButton`・`FormDivider` を提供。ログイン・サインアップページで共用
- `components/layout/app-sidebar.tsx` — サイドバー。`clients`・`fullName: string`・`avatarUrl?: string` を props で受け取る。`avatarUrl` がある場合は Next.js `Image` で Google プロフィール画像を表示、ない場合は User アイコンにフォールバック。ヘッダーに Work-Log ロゴ（`/` へのリンク）・クライアントプルダウン（切り替え時は現在のページ種別を維持しつつ遷移: records ページは同じ yearMonth を保持、clients ページは clients ページへ、それ以外は打刻ページへ）・切り替え時に sonner トースト通知・ユーザーアバターと表示名インライン編集（鉛筆アイコン → 入力フィールド＋保存/キャンセルボタン、`profiles.full_name` を Supabase で更新）。ナビメニュー（打刻・勤怠一覧・クライアント管理）は `font-bold`、アクティブ項目の左側インジケーターバーは framer-motion の `layoutId="sidebar-active-indicator"` で項目間をスライドするスプリングアニメーション（`stiffness: 500, damping: 35`）、背景色・テキスト色は `data-[active=true]` で primary カラーに変化。`SidebarFooter` にログアウトボタン（上部）を配置し、ボーダーで区切った下部にプライバシーポリシー・利用規約・お問い合わせへのリンクを配置。`app/(app)/layout.tsx` が `profiles` から取得した `fullName` と `user.user_metadata.avatar_url` を渡す。`useSidebar` フックの `setOpenMobile()` をクライアント切り替え・ナビリンク・ログアウト時に呼び出しモバイルでサイドバーを自動クローズ
- `components/layout/theme-toggle.tsx` — ダークモード切り替えボタン（Sun/Moon アイコン）。`app/(app)/layout.tsx` のヘッダー右端（`ml-auto`）に配置
- `components/providers/theme-provider.tsx` — `next-themes` の `ThemeProvider` ラッパー。`app/layout.tsx` で使用
- `components/layout/back-button.tsx` — 戻るボタンコンポーネント（Client Component）。`router.back()` を使用した ChevronLeft アイコン付きゴーストボタン。法律ページで使用
- `components/layout/lp-header.tsx` — ランディングページ専用固定ヘッダー。ロゴ・サインアップ/ログインリンク・テーマトグルを配置。sticky 配置で背景ぼかし効果（backdrop-blur-xs）付き
- `components/layout/lp-footer.tsx` — ランディングページフッター。プライバシーポリシー・利用規約・お問い合わせへのリンクを含む。`app/page.tsx` と `app/(legal)/layout.tsx` で使用
- `components/dashboard/clock-display.tsx` — リアルタイムクロック表示（1秒ごとに更新）。ハイドレーション対策で初期値を `null` にし、`setInterval` の最初のコールバック（マウントから最大1秒後）で時刻をセット。日付（年月日・曜日）と時刻（HH:MM:SS）を表示し、時刻はグラデーションテキスト（`bg-gradient-to-br from-foreground to-foreground/60`）で描画。時刻フォントサイズは `text-7xl`（固定）
- `components/dashboard/punch-buttons.tsx` — 出退勤ボタン。`client` と `initialRecord` を props で受け取り、Realtime でライブ更新。`is_off`（本日休み）チェックボックス・`note`（業務内容・備考）テキストエリア（onBlur 保存）を備える。`isClientHoliday()` でクライアント設定の休日を自動判定し `is_off` 初期値に反映。ステータスに応じたカードのグラデーションバーと状態バッジ（出勤中はパルスアニメーション）を表示
- `components/records/records-page-content.tsx` — 勤怠一覧ページの Client Component。`initialNote?` prop を受け取り `MonthlyTable` に転送。PDF出力時の勤怠漏れチェック結果（`highlightDates`）を状態管理し、漏れがある場合は警告バナーを表示。`ExportPdfButton` と警告バナーを `headerAction` prop 経由で `MonthlyTable` カードヘッダー内に注入する構成
- `components/records/monthly-table.tsx` — 月次勤怠テーブル。`client`, `initialRecords`, `year`, `month`, `highlightDates?`, `initialNote?`, `headerAction?: React.ReactNode` を props で受け取り、月切り替えは `router.push` でURL遷移。`headerAction` が渡された場合は CardHeader 上部に描画（PDF ボタン・警告バナーの注入に使用）。列構成: 日・曜日（祝日名をサブテキストで表示）・休みチェックボックス・開始・終了・休憩・稼働時間・業務内容備考。セルはクリックで編集モードに入るインライン編集方式（`renderEditableCell`）で、`note` 列はクリックで `Textarea`、時刻・数値列は `Input` に切り替わる。開始・終了時刻は5分刻み（`step={300}`）、休憩は5分刻み数値入力。保存時に `floorTimeStringToFiveMinutes()` で時刻を5分単位に切り捨て。ヘッダーに合計稼働時間・標準工数範囲・推定稼働時間を表示。合計稼働時間の下に月次備考 `Textarea`（onBlur で `monthly_notes` に upsert）を表示。`isClientHoliday()` でクライアント設定の休日を自動判定し `is_off` デフォルト値に反映。Realtime でタブ間同期。`highlightDates` に含まれる日付のセルは赤枠強調表示
- `components/records/export-pdf-button.tsx` — PDF出力ボタン。`client`, `year`, `month`, `onMissingCheck` を props で受け取る。クリック時にまず稼働データ有無を確認（なければ sonner でエラートースト「この月には稼働データがありません」を表示して終了）。次に勤怠漏れチェック（`computeMissingDates`）を実行し（過去・今日・未来日を問わず非休日の勤務日でレコードがない or 未入力を漏れとみなす）、漏れがあれば `onMissingCheck` コールバックに日付リストを渡して終了。漏れがなければ `fetchData()` 内で `monthly_notes` も取得し `remarks` として `generateReportBlobUrl` に渡して PDF を生成、プレビューダイアログ（`<Dialog>` + `<iframe>`）を開く。ダイアログ内のダウンロードボタンで `generateReport` を呼び出してファイル保存する
- `components/clients/clients-page-content.tsx` — クライアント管理画面の Client Component。`clients` と `currentClientId` を props で受け取る。Table レイアウトで一覧表示し、各行にカスタム円形ボタン（アクティブクライアント切り替え、`rounded-full border-2 border-primary` スタイルで内側ドットで選択状態を表現）・クライアント名・標準工数（min〜max h）・定時（開始〜終了）・休憩分・休み設定（曜日＋祝日）・編集ボタン・削除ボタンを表示。ボタン押下時は `router.push` でクライアント切り替えと `sonner` トースト通知。削除時は confirm ダイアログ表示後 Supabase で削除し、削除対象が現在のクライアントなら `/dashboard` にリダイレクト
- `components/clients/client-form-dialog.tsx` — クライアント追加・編集フォームダイアログ（`clients-page-content` から利用）
- `components/setup/setup-wizard.tsx` — 初回セットアップウィザード（Client Component）。2ステップ形式: Step1で氏名を `profiles` に保存、Step2でクライアント情報を `clients` に INSERT して `/dashboard/{id}` に遷移

### スタイリング
- オレンジのプライマリカラーを CSS 変数（hex/rgba）で `app/globals.css` に定義
- `next-themes` による class ストラテジーのダークモード
- `lib/utils.ts` の `cn()` で条件付きクラス名を結合（clsx + tailwind-merge）
- Tailwind CSS v4（PostCSS プラグイン、tailwind.config ファイルなし。テーマは globals.css にインライン定義）
- アニメーション: `framer-motion` を使用。サイドバーナビの `layoutId` によるレイアウトアニメーションなど

### テスト
- Jest + React Testing Library（`jest.config.ts`、`jest.setup.ts`）
- テストは `__tests__/` ディレクトリにソース構造をミラーして配置
- `__tests__/lib/time-utils.test.ts`、`__tests__/lib/holidays.test.ts`

## 環境変数

`.env.local` に以下を設定:
```
NEXT_PUBLIC_SUPABASE_URL=<project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SLACK_WEBHOOK_URL=<slack-incoming-webhook-url>
```

## コーディング規約

- インタラクティブなコンポーネントには `"use client"` ディレクティブを付与
- コンポーネントファイルは kebab-case、`components/` 配下に機能ごとに整理
- shadcn/ui コンポーネントは `components/ui/` に配置（style: new-york、icon: lucide）
- パスワード入力フィールドは `<Input type="password">` でなく `components/ui/password-input.tsx` の `PasswordInput` を使用（Eye/EyeOff アイコンで表示/非表示トグル付き、`tabIndex={-1}` でトグルボタンをタブスキップ）
- パスエイリアス `@/` はプロジェクトルートを指す（`src/` ではない）
- フォームバリデーション: `react-hook-form` + `zod`（`@hookform/resolvers` 経由）を使用
- フォームの送信中状態は `react-hook-form` の `formState.isSubmitting` を使わず `useState` で自前管理する。これにより `router.push` 後もボタンが「処理中」表示のままページ遷移できる
- ドキュメント: `.docs/要件定義.md`（要件定義）、`.docs/実装プラン.md`（実装プラン）、`.docs/メモ.md`（機能メモ・改善候補）
