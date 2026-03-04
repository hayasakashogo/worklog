import { getDaysInMonth, getWeekdayLabel, getHolidayLabel, isHoliday, isClientHoliday } from "@/lib/holidays"
import type { Client } from "@/types/client"

const baseClient: Client = {
  id: "test-id",
  name: "テスト",
  min_hours: 140,
  max_hours: 180,
  default_start_time: "09:00",
  default_end_time: "18:00",
  default_rest_minutes: 60,
  holidays: [],
  include_national_holidays: false,
  pdf_filename_template: "",
}

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

describe("getHolidayLabel", () => {
  it("元日（2026/1/1）は「元日」を返す", () => {
    expect(getHolidayLabel(new Date(2026, 0, 1))).toBe("元日")
  })

  it("憲法記念日（2026/5/3）は「憲法記念日」を返す", () => {
    expect(getHolidayLabel(new Date(2026, 4, 3))).toBe("憲法記念日")
  })

  it("成人の日（2026/1/12）は「成人の日」を返す", () => {
    expect(getHolidayLabel(new Date(2026, 0, 12))).toBe("成人の日")
  })

  it("平日はnullを返す", () => {
    expect(getHolidayLabel(new Date(2026, 0, 6))).toBeNull()
  })

  it("土曜日はnullを返す", () => {
    expect(getHolidayLabel(new Date(2026, 0, 3))).toBeNull()
  })
})

describe("isClientHoliday", () => {
  it("holidays=[0,6] のとき土曜日は true", () => {
    const client = { ...baseClient, holidays: [0, 6] }
    expect(isClientHoliday(new Date(2026, 0, 3), client)).toBe(true) // 土曜
  })

  it("holidays=[0,6] のとき月曜日は false", () => {
    const client = { ...baseClient, holidays: [0, 6] }
    expect(isClientHoliday(new Date(2026, 0, 5), client)).toBe(false) // 月曜
  })

  it("holidays=[] のとき土曜日も false", () => {
    expect(isClientHoliday(new Date(2026, 0, 3), baseClient)).toBe(false)
  })

  it("include_national_holidays=true のとき元日は true", () => {
    const client = { ...baseClient, include_national_holidays: true }
    expect(isClientHoliday(new Date(2026, 0, 1), client)).toBe(true) // 元日（木曜）
  })

  it("include_national_holidays=true のとき平日（非祝日）は false", () => {
    const client = { ...baseClient, include_national_holidays: true }
    expect(isClientHoliday(new Date(2026, 0, 6), client)).toBe(false) // 火曜・非祝日
  })

  it("include_national_holidays=false のとき元日も false", () => {
    expect(isClientHoliday(new Date(2026, 0, 1), baseClient)).toBe(false)
  })

  it("曜日と祝日の両方に該当する場合も true", () => {
    // 2026/1/4 は日曜かつ非祝日だが、曜日だけで true になるケース
    const client = { ...baseClient, holidays: [0, 6], include_national_holidays: true }
    expect(isClientHoliday(new Date(2026, 0, 4), client)).toBe(true) // 日曜
  })

  it("曜日は非休日だが祝日に該当する場合も true", () => {
    // 2026/1/1 は木曜（非休日曜日）かつ元日（祝日）
    const client = { ...baseClient, holidays: [0, 6], include_national_holidays: true }
    expect(isClientHoliday(new Date(2026, 0, 1), client)).toBe(true) // 元日
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
