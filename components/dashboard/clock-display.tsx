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
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground mb-3">&nbsp;</p>
        <p className="text-8xl font-bold tabular-nums tracking-tight text-transparent">&nbsp;</p>
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
    <div className="text-center py-8">
      <p className="text-sm font-medium text-muted-foreground tracking-wide mb-3">{dateStr}</p>
      <p className="text-8xl font-bold tabular-nums tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
        {timeStr}
      </p>
    </div>
  )
}
