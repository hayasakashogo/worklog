export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <div className="relative size-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">読み込み中...</p>
    </div>
  )
}
