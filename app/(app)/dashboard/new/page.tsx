import { createClient } from "@/lib/supabase/server"
import { SetupWizard } from "@/components/setup/setup-wizard"

export default async function NewSetupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let initialFullName = ""
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
    initialFullName = profile?.full_name ?? ""
  }

  return <SetupWizard initialFullName={initialFullName} />
}
