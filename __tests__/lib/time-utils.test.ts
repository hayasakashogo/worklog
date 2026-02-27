import {
  floorToFiveMinutes,
  calcWorkingHours,
  formatHoursToHHMM,
  timeToMinutes,
  todayString,
} from "@/lib/time-utils"

describe("floorToFiveMinutes", () => {
  it("9:07 → 09:05", () => {
    const date = new Date(2026, 0, 1, 9, 7)
    expect(floorToFiveMinutes(date)).toBe("09:05")
  })

  it("18:13 → 18:10", () => {
    const date = new Date(2026, 0, 1, 18, 13)
    expect(floorToFiveMinutes(date)).toBe("18:10")
  })

  it("ちょうど5分刻みならそのまま", () => {
    const date = new Date(2026, 0, 1, 10, 30)
    expect(floorToFiveMinutes(date)).toBe("10:30")
  })

  it("0:04 → 00:00", () => {
    const date = new Date(2026, 0, 1, 0, 4)
    expect(floorToFiveMinutes(date)).toBe("00:00")
  })
})

describe("timeToMinutes", () => {
  it("09:00 → 540", () => {
    expect(timeToMinutes("09:00")).toBe(540)
  })

  it("18:30 → 1110", () => {
    expect(timeToMinutes("18:30")).toBe(1110)
  })

  it("00:00 → 0", () => {
    expect(timeToMinutes("00:00")).toBe(0)
  })
})

describe("calcWorkingHours", () => {
  it("09:00〜18:00 休憩60分 → 8時間", () => {
    expect(calcWorkingHours("09:00", "18:00", 60)).toBe(8)
  })

  it("startTimeがnullならnull", () => {
    expect(calcWorkingHours(null, "18:00", 60)).toBeNull()
  })

  it("endTimeがnullならnull", () => {
    expect(calcWorkingHours("09:00", null, 60)).toBeNull()
  })

  it("休憩が勤務時間を超える場合は0", () => {
    expect(calcWorkingHours("09:00", "09:30", 60)).toBe(0)
  })
})

describe("formatHoursToHHMM", () => {
  it("8 → 8:00", () => {
    expect(formatHoursToHHMM(8)).toBe("8:00")
  })

  it("7.5 → 7:30", () => {
    expect(formatHoursToHHMM(7.5)).toBe("7:30")
  })

  it("0 → 0:00", () => {
    expect(formatHoursToHHMM(0)).toBe("0:00")
  })
})

describe("todayString", () => {
  it("YYYY-MM-DD形式を返す", () => {
    const result = todayString()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
