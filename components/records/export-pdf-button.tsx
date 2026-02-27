"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Client } from "@/types/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { generateReport, generateReportBlobUrl } from "@/lib/pdf/generate-report"
import { getDaysInMonth, isClientHoliday } from "@/lib/holidays"

type TimeRecord = {
  date: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off?: boolean
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

function computeMissingDates(records: TimeRecord[], client: Client, year: number, month: number): string[] {
  const recordMap = new Map(records.map((r) => [r.date, r]))
  const days = getDaysInMonth(year, month)
  const todayStr = formatDate(new Date())

  return days
    .filter((day) => {
      const dateStr = formatDate(day)
      if (dateStr >= todayStr) return false
      if (isClientHoliday(day, client)) return false
      const record = recordMap.get(dateStr)
      if (record?.is_off) return false
      return !record || record.start_time === null || record.end_time === null
    })
    .map((day) => formatDate(day))
}

export function ExportPdfButton({
  client,
  year,
  month,
  onMissingCheck,
}: {
  client: Client
  year: number
  month: number
  onMissingCheck: (missingDates: string[]) => void
}) {
  const [generating, setGenerating] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const supabase = createClient()

  const fetchData = async () => {
    const startDate = `${year}-${month.toString().padStart(2, "0")}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay}`

    const [recordsResult, profileResult] = await Promise.all([
      supabase
        .from("time_records")
        .select("*")
        .eq("client_id", client.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date"),
      supabase.from("profiles").select("full_name").single(),
    ])

    return {
      records: (recordsResult.data ?? []) as TimeRecord[],
      fullName: profileResult.data?.full_name ?? "",
    }
  }

  const handleClick = async () => {
    setGenerating(true)
    try {
      const { records, fullName } = await fetchData()
      const missing = computeMissingDates(records, client, year, month)
      onMissingCheck(missing)

      if (missing.length > 0) return

      const url = await generateReportBlobUrl({ client, fullName, year, month, records, remarks: "" })
      setBlobUrl(url)
      setPreviewOpen(true)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { records, fullName } = await fetchData()
      await generateReport({ client, fullName, year, month, records, remarks: "" })
    } finally {
      setDownloading(false)
    }
  }

  const handleClose = () => {
    setPreviewOpen(false)
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl)
      setBlobUrl(null)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={handleClick} disabled={generating}>
        <Download className="mr-2 h-4 w-4" />
        {generating ? "確認中..." : "PDF出力"}
      </Button>

      <Dialog open={previewOpen} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>稼働報告書プレビュー</DialogTitle>
          </DialogHeader>
          {blobUrl && (
            <iframe src={blobUrl} className="flex-1 w-full rounded border" />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>閉じる</Button>
            <Button onClick={handleDownload} disabled={downloading}>
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "生成中..." : "ダウンロード"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
