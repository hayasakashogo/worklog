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
import { toast } from "sonner"
import { generateReport, generateReportBlobUrl } from "@/lib/pdf/generate-report"
import { computeMissingDates, type TimeRecord } from "@/lib/missing-dates"

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
    const yearMonth = `${year}-${month.toString().padStart(2, "0")}`

    try {
      const [recordsResult, profileResult, noteResult] = await Promise.all([
        supabase
          .from("time_records")
          .select("*")
          .eq("client_id", client.id)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date"),
        supabase.from("profiles").select("full_name").single(),
        supabase
          .from("monthly_notes")
          .select("note")
          .eq("client_id", client.id)
          .eq("year_month", yearMonth)
          .maybeSingle(),
      ])

      if (recordsResult.error) throw recordsResult.error
      if (profileResult.error) throw profileResult.error

      return {
        records: (recordsResult.data ?? []) as TimeRecord[],
        fullName: profileResult.data?.full_name ?? "",
        remarks: noteResult.data?.note ?? "",
      }
    } catch (err) {
      toast.error("データの取得に失敗しました")
      throw err
    }
  }

  const handleClick = async () => {
    setGenerating(true)
    try {
      const { records, fullName, remarks } = await fetchData()

      const hasWorkData = records.some((r) => r.start_time !== null && r.end_time !== null)
      if (!hasWorkData) {
        toast.error("この月には稼働データがありません")
        onMissingCheck([])
        return
      }

      const missing = computeMissingDates(records, client, year, month)
      onMissingCheck(missing)

      if (missing.length > 0) return

      const url = await generateReportBlobUrl({ client, fullName, year, month, records, remarks })
      setBlobUrl(url)
      setPreviewOpen(true)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const { records, fullName, remarks } = await fetchData()
      await generateReport({ client, fullName, year, month, records, remarks })
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
      <Button variant="default" onClick={handleClick} disabled={generating} className="font-bold">
        <Download className="mr-2 h-4 w-4" />
        {generating ? "確認中..." : "PDF出力"}
      </Button>

      <Dialog open={previewOpen} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="sm:max-w-6xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>稼働報告書プレビュー</DialogTitle>
          </DialogHeader>
          {blobUrl && (
            <iframe src={blobUrl} className="flex-1 w-full rounded border" />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>閉じる</Button>
            <Button onClick={handleDownload} disabled={downloading} className="font-bold">
              <Download className="mr-2 h-4 w-4" />
              {downloading ? "生成中..." : "ダウンロード"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
