import { render, screen, fireEvent } from "@testing-library/react"
import { localizeError, GoogleAuthButton, FormDivider } from "@/components/auth/auth-form"

jest.mock("@/lib/supabase/client", () => ({ createClient: () => ({}) }))
jest.mock("react-icons/fc", () => ({ FcGoogle: () => null }))

describe("localizeError", () => {
  it("'Invalid login credentials' → 日本語エラー", () => {
    expect(localizeError("Invalid login credentials")).toBe(
      "メールアドレスまたはパスワードが正しくありません"
    )
  })

  it("'Email not confirmed' → 日本語エラー", () => {
    expect(localizeError("Email not confirmed")).toBe(
      "メールアドレスが確認されていません"
    )
  })

  it("'User already registered' → 日本語エラー", () => {
    expect(localizeError("User already registered")).toBe(
      "このメールアドレスはすでに登録されています"
    )
  })

  it("'too many requests' → 日本語エラー", () => {
    expect(localizeError("too many requests")).toBe(
      "しばらく待ってから再試行してください"
    )
  })

  it("'rate limit' → 日本語エラー", () => {
    expect(localizeError("rate limit exceeded")).toBe(
      "しばらく待ってから再試行してください"
    )
  })

  it("'Password should be at least 6 characters' → 日本語エラー", () => {
    expect(localizeError("Password should be at least 6 characters")).toBe(
      "パスワードは6文字以上で入力してください"
    )
  })

  it("'New password should be different from the old password' → 日本語エラー", () => {
    expect(localizeError("New password should be different from the old password")).toBe(
      "新しいパスワードは現在のパスワードと異なるものを設定してください"
    )
  })

  it("未知のメッセージはそのまま返す", () => {
    expect(localizeError("Unknown error occurred")).toBe("Unknown error occurred")
  })

  it("includes による部分一致で判定される", () => {
    // メッセージの一部を含む長い文字列でも正しく変換される
    expect(localizeError("Error: Invalid login credentials for user")).toBe(
      "メールアドレスまたはパスワードが正しくありません"
    )
  })
})

describe("GoogleAuthButton", () => {
  it("ラベルテキストが描画される", () => {
    render(<GoogleAuthButton label="Googleでログイン" onClick={() => {}} />)
    expect(screen.getByText("Googleでログイン")).toBeInTheDocument()
  })

  it("クリック時に onClick が呼ばれる", () => {
    const onClick = jest.fn()
    render(<GoogleAuthButton label="Googleでログイン" onClick={onClick} />)
    fireEvent.click(screen.getByRole("button"))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe("FormDivider", () => {
  it("「または」テキストが描画される", () => {
    render(<FormDivider />)
    expect(screen.getByText("または")).toBeInTheDocument()
  })
})
