import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="flex items-center justify-center">
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-16 w-full max-w-xl mb-4" />
          <div className="border border-border/40 rounded-md overflow-hidden">
            <div className="p-2 space-y-1">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 22 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
