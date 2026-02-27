declare module "japanese-holidays" {
  export function isHoliday(date: Date): string | undefined
  export function isHolidayAt(date: Date): string | undefined
  export function getHolidaysOf(year: number, furikae?: boolean): { month: number; date: number; name: string }[]
}
