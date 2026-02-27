import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { getDaysInMonth, getWeekdayLabel, isHoliday } from "@/lib/holidays"
import { calcWorkingHours, formatHoursToHHMM } from "@/lib/time-utils"

type Client = {
  name: string
  min_hours: number
  max_hours: number
  pdf_filename_template: string
  holidays: number[]
  include_national_holidays: boolean
  default_rest_minutes: number
}

type TimeRecord = {
  date: string
  start_time: string | null
  end_time: string | null
  rest_minutes: number
  note: string
  is_off?: boolean
}

type ReportParams = {
  client: Client
  fullName: string
  year: number
  month: number
  records: TimeRecord[]
  remarks: string
}

async function buildReport(params: ReportParams): Promise<jsPDF> {
  const { client, fullName, year, month, records, remarks } = params

  // NotoSansJP フォントをロード（public/fonts に配置した TTF を使用）
  const fontResponse = await fetch("/fonts/NotoSansJP-Regular.ttf")
  const fontBuffer = await fontResponse.arrayBuffer()
  const fontBase64 = btoa(
    new Uint8Array(fontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  )

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  // フォント登録
  doc.addFileToVFS("NotoSansJP-Regular.ttf", fontBase64)
  doc.addFont("NotoSansJP-Regular.ttf", "NotoSansJP", "normal")
  doc.setFont("NotoSansJP")

  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 15
  let y = 20

  // 宛名
  doc.setFontSize(12)
  doc.text(`${client.name} 御中`, marginLeft, y)
  y += 15

  // タイトル
  doc.setFontSize(18)
  doc.text("稼働報告書", pageWidth / 2, y, { align: "center" })
  y += 15

  // 業務従事者
  doc.setFontSize(10)
  doc.text(`業務従事者: ${fullName}`, pageWidth - marginLeft, y, { align: "right" })
  y += 10

  // レコードマップ
  const recordMap = new Map<string, TimeRecord>()
  records.forEach((r) => recordMap.set(r.date, r))

  // 合計稼働時間（is_off=true の行は除外）
  let totalHours = 0
  records.forEach((r) => {
    if (r.is_off) return
    const h = calcWorkingHours(
      r.start_time?.slice(0, 5) ?? null,
      r.end_time?.slice(0, 5) ?? null,
      r.rest_minutes
    )
    if (h) totalHours += h
  })

  // サマリテーブル
  autoTable(doc, {
    startY: y,
    head: [["年月", "標準工数", "稼働時間合計"]],
    body: [
      [
        `${year}年${month}月`,
        `${client.min_hours}h 〜 ${client.max_hours}h`,
        `${formatHoursToHHMM(totalHours)} (${totalHours.toFixed(2)}h)`,
      ],
    ],
    styles: { font: "NotoSansJP", fontSize: 9 },
    headStyles: { font: "NotoSansJP", fontStyle: "normal", fillColor: [234, 120, 40] },
    margin: { left: marginLeft, right: marginLeft },
  })

  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8

  // 備考欄
  if (remarks) {
    doc.setFontSize(9)
    doc.text(`備考: ${remarks}`, marginLeft, y)
    y += 8
  }

  // 稼働詳細見出し
  doc.setFontSize(12)
  doc.text("【稼働詳細】", marginLeft, y)
  y += 5

  // 詳細テーブル
  const days = getDaysInMonth(year, month)
  const tableBody = days.map((day) => {
    const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`
    const record = recordMap.get(dateStr)
    if (record?.is_off) {
      return [`${month}/${day.getDate()}`, getWeekdayLabel(day), "", "", "", "", record.note ?? ""]
    }
    const startTime = record?.start_time?.slice(0, 5) ?? ""
    const endTime = record?.end_time?.slice(0, 5) ?? ""
    const restMin = record?.rest_minutes ?? 0
    const note = record?.note ?? ""
    const workHours = calcWorkingHours(startTime || null, endTime || null, restMin)

    return [
      `${month}/${day.getDate()}`,
      getWeekdayLabel(day),
      startTime,
      endTime,
      restMin > 0 && startTime ? `${Math.floor(restMin / 60)}:${(restMin % 60).toString().padStart(2, "0")}` : "",
      workHours !== null ? formatHoursToHHMM(workHours) : "",
      note,
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [["日付", "曜日", "開始", "終了", "休憩", "稼働時間", "業務内容・備考"]],
    body: tableBody,
    styles: { font: "NotoSansJP", fontSize: 8, cellPadding: 1.5 },
    headStyles: { font: "NotoSansJP", fontStyle: "normal", fillColor: [234, 120, 40] },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 14 },
      2: { cellWidth: 18 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 20 },
      6: { cellWidth: "auto" },
    },
    margin: { left: marginLeft, right: marginLeft },
    didParseCell: (data) => {
      if (data.section === "body") {
        const rowIndex = data.row.index
        const day = days[rowIndex]
        const dateStr = `${year}-${month.toString().padStart(2, "0")}-${day.getDate().toString().padStart(2, "0")}`
        const record = recordMap.get(dateStr)
        const dow = day.getDay()
        if (record?.is_off || client.holidays.includes(dow) || (client.include_national_holidays && isHoliday(day))) {
          data.cell.styles.fillColor = [245, 245, 245]
          data.cell.styles.textColor = [150, 150, 150]
        }
      }
    },
  })

  return doc
}

export async function generateReportBlobUrl(params: ReportParams): Promise<string> {
  const doc = await buildReport(params)
  const blob = doc.output("blob")
  return URL.createObjectURL(blob)
}

export async function generateReport(params: ReportParams): Promise<void> {
  const { client, year, month } = params
  const doc = await buildReport(params)

  const filename = client.pdf_filename_template
    .replace("{YYYY}", String(year))
    .replace("{MM}", month.toString().padStart(2, "0"))
    .replace("{CLIENT}", client.name)

  doc.save(`${filename}.pdf`)
}
