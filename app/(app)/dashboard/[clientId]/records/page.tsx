import { redirect } from "next/navigation"

export default async function RecordsRedirectPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params
  const now = new Date()
  const yearMonth = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`
  redirect(`/dashboard/${clientId}/records/${yearMonth}`)
}
