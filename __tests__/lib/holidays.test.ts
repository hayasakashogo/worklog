import { getDaysInMonth, getWeekdayLabel, isHoliday } from "@/lib/holidays"

describe("getDaysInMonth", () => {
  it("2026年2月は28日間", () => {
    const days = getDaysInMonth(2026, 2)
    expect(days).toHaveLength(28)
    expect(days[0].getDate()).toBe(1)
    expect(days[27].getDate()).toBe(28)
  })

  it("2024年2月（うるう年）は29日間", () => {
    const days = getDaysInMonth(2024, 2)
    expect(days).toHaveLength(29)
  })

  it("2026年1月は31日間", () => {
    const days = getDaysInMonth(2026, 1)
    expect(days).toHaveLength(31)
  })
})

describe("getWeekdayLabel", () => {
  it("日曜日 → 日", () => {
    const sunday = new Date(2026, 0, 4) // 2026-01-04 is Sunday
    expect(getWeekdayLabel(sunday)).toBe("日")
  })

  it("月曜日 → 月", () => {
    const monday = new Date(2026, 0, 5)
    expect(getWeekdayLabel(monday)).toBe("月")
  })

  it("土曜日 → 土", () => {
    const saturday = new Date(2026, 0, 3)
    expect(getWeekdayLabel(saturday)).toBe("土")
  })
})

describe("isHoliday", () => {
  it("元日（1/1）は祝日", () => {
    expect(isHoliday(new Date(2026, 0, 1))).toBe(true)
  })

  it("平日は祝日でない", () => {
    expect(isHoliday(new Date(2026, 0, 6))).toBe(false)
  })
})
