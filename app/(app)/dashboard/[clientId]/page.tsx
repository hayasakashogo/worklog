import { createClient } from "@/lib/supabase/server"
import { ClockDisplay } from "@/components/dashboard/clock-display"
import { PunchButtons } from "@/components/dashboard/punch-buttons"
import { todayString } from "@/lib/time-utils"
import type { Client } from "@/types/client"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const [{ data: client }, { data: record }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", clientId).single(),
    supabase
      .from("time_records")
      .select("*")
      .eq("client_id", clientId)
      .eq("date", todayString())
      .maybeSingle(),
  ])

  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      <ClockDisplay />
      <PunchButtons client={client as Client} initialRecord={record} />
    </div>
  )
}
