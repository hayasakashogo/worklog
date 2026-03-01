/**
 * 時刻を5分刻みで切り捨てる
 * 例: 9:07 → 9:05, 18:13 → 18:10
 */
export function floorToFiveMinutes(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = (Math.floor(date.getMinutes() / 5) * 5).toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

/**
 * HH:MM形式の時刻文字列を5分刻みで切り捨てる
 * 例: "09:07" → "09:05", "18:13" → "18:10"
 */
export function floorTimeStringToFiveMinutes(time: string): string {
  const [h, m] = time.split(":").map(Number)
  const minutes = (Math.floor(m / 5) * 5).toString().padStart(2, "0")
  return `${h.toString().padStart(2, "0")}:${minutes}`
}

/**
 * HH:MM形式の時間文字列から分数を計算
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/**
 * 稼働時間を計算（時間単位）
 */
export function calcWorkingHours(
  startTime: string | null,
  endTime: string | null,
  restMinutes: number
): number | null {
  if (!startTime || !endTime) return null
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const diff = end - start - restMinutes
  return diff > 0 ? diff / 60 : 0
}

/**
 * 時間数を HH:MM 形式にフォーマット
 */
export function formatHoursToHHMM(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}:${m.toString().padStart(2, "0")}`
}

/**
 * 今日の日付を YYYY-MM-DD 形式で返す
 */
export function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
}
