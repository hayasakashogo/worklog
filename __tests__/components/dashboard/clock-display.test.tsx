import { render, screen, act } from "@testing-library/react"
import { ClockDisplay } from "@/components/dashboard/clock-display"

describe("ClockDisplay", () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it("初期レンダリング時（now === null）は時刻テキストを表示しない", () => {
    jest.useFakeTimers()
    render(<ClockDisplay />)
    expect(screen.queryByText(/\d{2}:\d{2}:\d{2}/)).not.toBeInTheDocument()
  })

  it("タイマー起動後に日本語フォーマットの日付・時刻文字列を描画する", () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date("2026-03-04T13:45:30"))
    render(<ClockDisplay />)

    act(() => {
      jest.runOnlyPendingTimers()
    })

    expect(screen.getByText(/年/)).toBeInTheDocument()
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument()
  })
})
