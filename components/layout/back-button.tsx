"use client"

import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()
  return (
    <Button variant="ghost" size="sm" className="mb-6 -ml-2" onClick={() => router.back()}>
      <ChevronLeft className="h-4 w-4" />
      戻る
    </Button>
  )
}
