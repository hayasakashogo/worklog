import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-6 pt-4">
      {/* ClockDisplay */}
      <div className="text-center py-8 flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-16 w-64" />
      </div>
      {/* PunchButtons */}
      <Card className="overflow-hidden shadow-md">
        <Skeleton className="h-1 w-full rounded-none" />
        <CardContent className="pt-6 pb-6 space-y-6">
          <div className="flex justify-center">
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          <div className="flex justify-center gap-3">
            <Skeleton className="h-14 w-32 rounded-xl" />
            <Skeleton className="h-14 w-32 rounded-xl" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="space-y-2 pt-2 border-t border-border/50">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
