"use client"

import { useState, useEffect } from "react"

export function ClockDisplay() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!now) {
    return (
      <div className="text-center">
        <p className="text-lg text-muted-foreground">&nbsp;</p>
        <p className="text-6xl font-bold tabular-nums tracking-tight">&nbsp;</p>
      </div>
    )
  }

  const dateStr = now.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })

  const timeStr = now.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

  return (
    <div className="text-center">
      <p className="text-lg text-muted-foreground">{dateStr}</p>
      <p className="text-6xl font-bold tabular-nums tracking-tight">{timeStr}</p>
    </div>
  )
}
