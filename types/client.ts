export type Client = {
  id: string
  name: string
  min_hours: number
  max_hours: number
  default_start_time: string
  default_end_time: string
  default_rest_minutes: number
  holidays: number[]
  include_national_holidays: boolean
  pdf_filename_template: string
}
