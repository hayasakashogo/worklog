import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ClientLayout({
  params,
  children,
}: {
  params: Promise<{ clientId: string }>
  children: React.ReactNode
}) {
  const { clientId } = await params

  // "new" は特別なパス（クライアント未登録時のフォールバック）
  if (clientId === "new") {
    return <>{children}</>
  }

  const supabase = await createClient()
  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle()

  if (!client) {
    notFound()
  }

  return <>{children}</>
}
