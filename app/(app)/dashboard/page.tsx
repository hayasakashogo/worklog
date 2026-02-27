import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRedirectPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from("clients")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)

  if (clients && clients.length > 0) {
    redirect(`/dashboard/${clients[0].id}`)
  }

  redirect("/dashboard/new")
}

