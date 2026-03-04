import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  try {
    if (!code) throw new Error("Authorization code is missing")
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw new Error(error.message)
    return NextResponse.redirect(`${origin}${next}`)
  } catch {
    return NextResponse.redirect(`${origin}/error`)
  }
}
