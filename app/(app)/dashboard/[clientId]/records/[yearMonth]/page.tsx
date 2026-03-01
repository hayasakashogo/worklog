import { createClient } from "@/lib/supabase/server"
import { RecordsPageContent } from "@/components/records/records-page-content"
import type { Client } from "@/types/client"

export default async function RecordsPage({
  params,
}: {
  params: Promise<{ clientId: string; yearMonth: string }>
}) {
  const { clientId, yearMonth } = await params
  const [yearStr, monthStr] = yearMonth.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)

  const supabase = await createClient()

  const startDate = `${year}-${monthStr}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDate = `${year}-${monthStr}-${lastDay.toString().padStart(2, "0")}`

  const [{ data: client }, { data: records }, { data: monthlyNote }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase
      .from("time_records")
      .select("*")
      .eq("client_id", clientId)
      .gte("date", startDate)
      .lte("date", endDate),
    supabase
      .from("monthly_notes")
      .select("note")
      .eq("client_id", clientId)
      .eq("year_month", yearMonth)
      .maybeSingle(),
  ])

  return (
    <RecordsPageContent
      client={client as Client}
      initialRecords={records ?? []}
      year={year}
      month={month}
      initialNote={monthlyNote?.note ?? ""}
    />
  )
}
