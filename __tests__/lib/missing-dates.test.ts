import { computeMissingDates, formatDate } from "@/lib/missing-dates"
import type { TimeRecord } from "@/lib/missing-dates"
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

describe("formatDate", () => {
  it("Date を YYYY-MM-DD 形式に変換する", () => {
    expect(formatDate(new Date(2026, 0, 1))).toBe("2026-01-01")
    expect(formatDate(new Date(2026, 11, 31))).toBe("2026-12-31")
  })
})

describe("computeMissingDates", () => {
  describe("records が空の場合", () => {
    it("holidays=[] なら全日が欠損扱い", () => {
      // 2026-01 は 31 日
      const result = computeMissingDates([], baseClient, 2026, 1)
      expect(result).toHaveLength(31)
      expect(result[0]).toBe("2026-01-01")
      expect(result[30]).toBe("2026-01-31")
    })

    it("holidays=[0,6] なら土日を除いた平日が欠損", () => {
      const client = { ...baseClient, holidays: [0, 6] }
      // 2026-01: 土曜 5 日（3,10,17,24,31）+ 日曜 4 日（4,11,18,25）= 9 日
      // 平日 = 31 - 9 = 22 日
      const result = computeMissingDates([], client, 2026, 1)
      expect(result).toHaveLength(22)
      expect(result).not.toContain("2026-01-03") // 土曜
      expect(result).not.toContain("2026-01-04") // 日曜
    })

    it("holidays=[0,6] + include_national_holidays=true なら祝日も除く", () => {
      const client = { ...baseClient, holidays: [0, 6], include_national_holidays: true }
      // 2026-01: 平日 22 日 - 元日(1/1,木) - 成人の日(1/12,月) = 20 日
      const result = computeMissingDates([], client, 2026, 1)
      expect(result).toHaveLength(20)
      expect(result).not.toContain("2026-01-01") // 元日
      expect(result).not.toContain("2026-01-12") // 成人の日
    })
  })

  describe("レコード有りの場合", () => {
    it("start_time が null のレコードは欠損扱い", () => {
      const records: TimeRecord[] = [
        { date: "2026-01-05", start_time: null, end_time: "18:00", rest_minutes: 60, note: "", is_off: false },
      ]
      const result = computeMissingDates(records, baseClient, 2026, 1)
      expect(result).toContain("2026-01-05")
    })

    it("end_time が null のレコードは欠損扱い", () => {
      const records: TimeRecord[] = [
        { date: "2026-01-05", start_time: "09:00", end_time: null, rest_minutes: 60, note: "", is_off: false },
      ]
      const result = computeMissingDates(records, baseClient, 2026, 1)
      expect(result).toContain("2026-01-05")
    })

    it("is_off=true のレコードは欠損扱いしない", () => {
      const records: TimeRecord[] = [
        { date: "2026-01-05", start_time: null, end_time: null, rest_minutes: 0, note: "", is_off: true },
      ]
      const result = computeMissingDates(records, baseClient, 2026, 1)
      expect(result).not.toContain("2026-01-05")
    })

    it("start_time と end_time が両方設定済みなら欠損でない", () => {
      // 全 31 日を埋める
      const records: TimeRecord[] = Array.from({ length: 31 }, (_, i) => ({
        date: `2026-01-${(i + 1).toString().padStart(2, "0")}`,
        start_time: "09:00",
        end_time: "18:00",
        rest_minutes: 60,
        note: "",
        is_off: false,
      }))
      const result = computeMissingDates(records, baseClient, 2026, 1)
      expect(result).toHaveLength(0)
    })
  })

  describe("返り値の形式", () => {
    it("返り値は YYYY-MM-DD 形式", () => {
      const result = computeMissingDates([], baseClient, 2026, 1)
      result.forEach((date) => {
        expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it("返り値は昇順", () => {
      const result = computeMissingDates([], baseClient, 2026, 1)
      for (let i = 1; i < result.length; i++) {
        expect(result[i] > result[i - 1]).toBe(true)
      }
    })
  })

  describe("月の境界", () => {
    it("非うるう年 2 月は 28 日まで", () => {
      const result = computeMissingDates([], baseClient, 2026, 2)
      expect(result[result.length - 1]).toBe("2026-02-28")
      expect(result).not.toContain("2026-02-29")
    })

    it("うるう年 2 月は 29 日まで", () => {
      const result = computeMissingDates([], baseClient, 2024, 2)
      expect(result[result.length - 1]).toBe("2024-02-29")
    })
  })
})
