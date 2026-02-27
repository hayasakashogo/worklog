import { createClient } from "@/lib/supabase/server"
import { ClientsPageContent } from "@/components/clients/clients-page-content"
import type { Client } from "@/types/client"

export default async function ClientsPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const supabase = await createClient()

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: true })

  return (
    <ClientsPageContent
      clients={(clients as Client[]) ?? []}
      currentClientId={clientId}
    />
  )
}
