"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function PdfPreviewButton({ src }: { src: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(true)}>
        サンプルを見る
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>稼働報告書サンプル</DialogTitle>
          </DialogHeader>
          <iframe src={src} className="w-full h-[70vh]" title="稼働報告書サンプル" />
        </DialogContent>
      </Dialog>
    </>
  )
}
